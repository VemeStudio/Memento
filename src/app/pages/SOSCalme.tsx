import { useState, useEffect, useRef } from "react";
import { useMetrics } from "../contexts/MetricsContext";
import { useUnifiedCards, type UnifiedCard } from "../contexts/UnifiedCardsContext";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { useIsMobile } from "../hooks/useIsMobile";
import { SettingsPopover } from "../components/SettingsPopover";
import { Send, Heart, Leaf, Settings } from "lucide-react";
import { LanguageSelector } from "../components/LanguageSelector";
import { useLang } from "../contexts/LangContext";
import type { T } from "../i18n/translations";

const PHASES = [
  { label: "Inhale", dur: 4 },
  { label: "Hold",   dur: 4 },
  { label: "Exhale", dur: 6 },
  { label: "Rest",   dur: 2 },
];


const INIT = [
  { id: "a0", from: "ai" as const, time: now(), text: "Hi, take a deep breath. Your mind is here, your home is safe. How can I support you right now?" },
];

function getBotResponse(text: string, cards: UnifiedCard[], t: T): { reply: string; triggerBreath: boolean } {
  const lower = text.toLowerCase();
  const kw = (t.sos as typeof t.sos & { keywords: { anxiety: string[]; routine: string[] } }).keywords;

  if (kw.anxiety.some(w => lower.includes(w)))
    return { reply: t.sos.breathingReply, triggerBreath: true };

  if (kw.routine.some(w => lower.includes(w))) {
    let bestCard: UnifiedCard | null = null;
    let bestScore = 0;
    for (const card of cards) {
      const translatedLabel = ((t.cards ?? {}) as Record<string, { label: string }>)[card.id]?.label ?? "";
      const labelText = [card.label, translatedLabel, card.description ?? ""].join(" ").toLowerCase();
      const words = labelText.split(" ").filter(w => w.length > 2);
      const score = words.filter(w => lower.includes(w)).length;
      if (score > 0 && score > bestScore) { bestScore = score; bestCard = card; }
    }
    if (bestCard) {
      const isSecured = bestCard.status === "Secure";
      return { reply: isSecured ? t.sos.securedReply : t.sos.pendingReply, triggerBreath: false };
    }
    return { reply: t.sos.pendingReply, triggerBreath: false };
  }

  if (["hello", "hi", "hey", "bonjour", "hola", "hallo", "salut", "你好"].some(w => lower.includes(w)))
    return { reply: t.sos.helloReply, triggerBreath: false };

  return { reply: t.sos.fallback, triggerBreath: false };
}

const MAX_ROUNDS = 2;

function useBreathing() {
  const [started,   setStarted]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const [round,     setRound]     = useState(1);
  const [pidx,      setPidx]      = useState(0);
  const [secs,      setSecs]      = useState(PHASES[0].dur);

  const pidxRef  = useRef(0);
  const secsRef  = useRef(PHASES[0].dur);
  const roundRef = useRef(1);

  useEffect(() => {
    if (!started || completed) return;
    const id = setInterval(() => {
      secsRef.current -= 1;
      if (secsRef.current <= 0) {
        const next = (pidxRef.current + 1) % PHASES.length;
        // Wrapping back to Inhale means a round just finished
        if (next === 0) {
          if (roundRef.current >= MAX_ROUNDS) {
            setCompleted(true);
            return; // effect cleanup clears the interval
          }
          roundRef.current += 1;
          setRound(roundRef.current);
        }
        pidxRef.current = next;
        secsRef.current = PHASES[next].dur;
        setPidx(next);
        setSecs(PHASES[next].dur);
      } else {
        setSecs(secsRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [started, completed]);

  function start() {
    pidxRef.current  = 0;
    secsRef.current  = PHASES[0].dur;
    roundRef.current = 1;
    setPidx(0); setSecs(PHASES[0].dur);
    setRound(1); setCompleted(false); setStarted(true);
  }

  function restart() {
    setStarted(false); setCompleted(false);
    pidxRef.current = 0; secsRef.current = PHASES[0].dur; roundRef.current = 1;
    setPidx(0); setSecs(PHASES[0].dur); setRound(1);
  }

  return { started, completed, round, start, restart, pidx, secs };
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function useChat(onBreathing: () => void, cards: UnifiedCard[], t: T) {
  type ChatMessage = { id: string; from: "ai" | "user"; time: string; text: string };
  const [msgs, setMsgs] = useState<ChatMessage[]>(() => ([
    { id: "a0", from: "ai", time: now(), text: t.sos.greeting as string },
  ] as ChatMessage[]));
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [msgs]);

  const adjustTextareaHeight = (target: HTMLTextAreaElement) => {
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 120) + "px";
  };

  function send() {
    const input = draft.trim();
    if (!input) return;
    const stamp = now();
    setMsgs((prev: ChatMessage[]) => [...prev, { id: `u${Date.now()}`, from: "user", time: stamp, text: input }]);
    setDraft("");
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = "40px";
    }
    const { reply, triggerBreath } = getBotResponse(input, cards, t);
    setTimeout(() => {
      setMsgs((prev: ChatMessage[]) => [...prev, { id: `a${Date.now()}`, from: "ai", time: now(), text: reply }]);
      if (triggerBreath) setTimeout(onBreathing, 500);
    }, 900);
  }

  return { msgs, draft, setDraft, send, endRef, messagesRef, textAreaRef, adjustTextareaHeight };
}

export function SOSCalme() {
  const isMobile = useIsMobile();
  const { t } = useLang();

  const PHASE_LABELS: Record<string, string> = {
    Inhale: t.sos.phaseInhale,
    Hold:   t.sos.phaseHold,
    Exhale: t.sos.phaseExhale,
    Rest:   t.sos.phaseRest,
  };
  const STEP_COPY: Record<string, string> = {
    Inhale: t.sos.stepInhale,
    Hold:   t.sos.stepHold,
    Exhale: t.sos.stepExhale,
    Rest:   t.sos.stepRest,
  };

  const [showSettings, setShowSettings] = useState(false);
  const { started, completed, round, start, restart, pidx, secs } = useBreathing();
  const { cards } = useUnifiedCards();
  const { msgs, draft, setDraft, send, endRef, messagesRef, textAreaRef, adjustTextareaHeight } = useChat(start, cards, t);
  const { addAnxietyDeescalated, addCalmMinutes } = useMetrics();

  useEffect(() => {
    if (completed) {
      addAnxietyDeescalated();
      addCalmMinutes(1); // one session ≈ 1 minute
    }
  }, [completed]);

  const phase    = PHASES[pidx];
  const isInhale = phase.label === "Inhale";
  const isExhale = phase.label === "Exhale";
  const isHold   = phase.label === "Hold";

  const animations = `
    @keyframes breathIn  { from{transform:scale(1.0)} to{transform:scale(1.28)} }
    @keyframes breathOut { from{transform:scale(1.28)} to{transform:scale(1.0)} }
    @keyframes aura { 0%,100%{opacity:.10;transform:scale(.85)} 50%{opacity:.24;transform:scale(1.05)} }
  `;

  /* ── MOBILE ── */
  if (isMobile) {
    const circleSize = 220;
    const bubbleR    = 74;
    const auraSize   = 188;

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "linear-gradient(170deg,#EFF4F1 0%,#F5F3EE 55%,#EEF0F4 100%)", fontFamily: "var(--font-family)", overflowY: "auto" }}>
        <style>{animations}</style>

        {/* Mobile header */}
        <header style={{ position: "relative", zIndex: 50, padding: "16px 20px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(44,53,49,0.08)", background: "rgba(239,244,241,0.92)", backdropFilter: "blur(10px)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Leaf size={13} color="#fff" strokeWidth={1.9} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t.sos.title}</p>
              <p style={{ fontSize: 11, color: "#7A8A84" }}>{t.sos.mobileSubtitle}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                style={{ width: 36, height: 36, borderRadius: 11, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4A6B5D", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,107,93,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Settings size={18} strokeWidth={1.8} />
              </button>
              {showSettings && <SettingsPopover onClose={() => setShowSettings(false)} direction="down" />}
            </div>
            <LanguageSelector compact />
          </div>
        </header>

        {/* Breathing widget — compact */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 20px 14px", borderBottom: "1px solid rgba(44,53,49,0.07)" }}>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 14 }}>{t.sos.breathingAnchor}</p>

          <div style={{ position: "relative", width: circleSize, height: circleSize, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(74,107,93,0.11)" }} />
            {started && (
              <div style={{ position: "absolute", width: auraSize, height: auraSize, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,107,93,0.17) 0%,rgba(74,107,93,0) 70%)", animation: "aura 4s ease-in-out infinite" }} />
            )}

            {completed ? (
              /* Completion bubble */
              <div style={{ width: bubbleR * 2, height: bubbleR * 2, borderRadius: "50%", background: "radial-gradient(circle at 38% 38%,#7EA896 0%,#4A6B5D 100%)", boxShadow: "0 8px 36px rgba(74,107,93,0.24)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, zIndex: 1 }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.3, padding: "0 10px" }}>{t.sos.done}</p>
              </div>
            ) : started ? (
              /* Active bubble */
              <div
                key={`${phase.label}-${pidx}`}
                style={{
                  width: bubbleR * 2, height: bubbleR * 2, borderRadius: "50%",
                  background: "radial-gradient(circle at 38% 38%,#7EA896 0%,#4A6B5D 100%)",
                  boxShadow: "0 8px 36px rgba(74,107,93,0.24)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, zIndex: 1,
                  animation: isInhale ? `breathIn ${phase.dur}s ease-in forwards`
                    : isExhale ? `breathOut ${phase.dur}s ease-out forwards` : "none",
                  transform: isHold ? "scale(1.28)" : (!isInhale && !isExhale) ? "scale(1.0)" : undefined,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 500, color: "#fff", letterSpacing: "-0.01em" }}>{PHASE_LABELS[phase.label] ?? phase.label}</p>
                <p style={{ fontSize: 32, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.04em", lineHeight: 1 }}>{secs}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{t.sos.seconds}</p>
              </div>
            ) : (
              /* Idle — tap to start */
              <button onClick={start} style={{
                width: bubbleR * 2, height: bubbleR * 2, borderRadius: "50%",
                background: "radial-gradient(circle at 38% 38%,#8FB8A8 0%,#4A6B5D 100%)",
                boxShadow: "0 8px 32px rgba(74,107,93,0.20)",
                border: "none", cursor: "pointer", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
                onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.95)", letterSpacing: "0.01em" }}>{t.sos.tapToStart}</p>
              </button>
            )}
          </div>

          {/* Round badge + phase dots */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {started && !completed && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "#4A6B5D", background: "rgba(74,107,93,0.1)", borderRadius: 20, padding: "3px 11px", letterSpacing: "0.04em" }}>
                {t.sos.round} {round} {t.sos.of} {MAX_ROUNDS}
              </span>
            )}
            <div style={{ display: "flex", gap: 6, opacity: started && !completed ? 1 : 0, transition: "opacity 0.4s" }}>
              {PHASES.map((p, i) => (
                <div key={p.label} style={{ height: 3, width: i === pidx ? 20 : 6, borderRadius: 3, background: i === pidx ? "#4A6B5D" : "rgba(74,107,93,0.2)", transition: "all 0.35s" }} />
              ))}
            </div>
          </div>

          {/* Bottom info card */}
          <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "12px 14px", width: "100%", backdropFilter: "blur(8px)" }}>
            {completed ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <p style={{ fontSize: 13, color: "#3A4B44", textAlign: "center", lineHeight: 1.65 }}>
                  {t.sos.wellDone}
                </p>
                <button onClick={restart} style={{ fontSize: 12, fontWeight: 500, color: "#4A6B5D", background: "rgba(74,107,93,0.1)", border: "none", borderRadius: 20, padding: "5px 16px", cursor: "pointer" }}>
                  {t.sos.restart}
                </button>
              </div>
            ) : started ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: phase.label !== "Rest" ? "#4A6B5D" : "#E8EDEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: phase.label !== "Rest" ? "#fff" : "#7A8A84" }}>
                    {PHASES.filter(p => p.label !== "Rest").findIndex(p => p.label === phase.label) + 1 || "·"}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#2C3531" }}>{STEP_COPY[phase.label] ?? "Rest quietly."}</span>
                <span style={{ fontSize: 11, color: "#9AA8A2", marginLeft: "auto", flexShrink: 0 }}>{phase.dur}s</span>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#7A8A84", textAlign: "center", lineHeight: 1.5 }}>
                {t.sos.tapCircle}
              </p>
            )}
          </div>
        </div>

        {/* AI chat — larger mobile panel */}
        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", minHeight: 420, overflow: "hidden" }}>
          <div style={{ padding: "10px 20px 6px", flexShrink: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A8A84" }}>{t.sos.aiAssistant}</p>
          </div>

          {/* Messages */}
          <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
            {/* Session marker */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#EAF2EE", borderRadius: 20, padding: "3px 11px" }}>
                <Heart size={9} strokeWidth={2} color="#4A6B5D" />
                <span style={{ fontSize: 10, fontWeight: 500, color: "#4A6B5D" }}>{t.sos.always}</span>
              </div>
            </div>

            {msgs.map(m => {
              const isAI = m.from === "ai";
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "86%" }}>
                    {isAI && (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                        <Heart size={10} strokeWidth={2} color="#fff" />
                      </div>
                    )}
                    <div style={{
                      background: isAI ? "#F2F7F4" : "#EDF0EE",
                      borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                      padding: "11px 14px",
                      boxShadow: "0 1px 2px rgba(44,53,49,0.06)",
                      border: isAI ? "1px solid rgba(74,107,93,0.1)" : "1px solid rgba(44,53,49,0.09)",
                    }}>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#2C3531" }}>{m.text}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "#9AA8A2", paddingLeft: isAI ? 34 : 0, paddingRight: isAI ? 0 : 4 }}>{m.time}</span>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input — sticky above bottom nav */}
          <div style={{ borderTop: "1px solid rgba(44,53,49,0.07)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end", background: "rgba(245,243,238,0.9)", backdropFilter: "blur(10px)", paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))", flexShrink: 0, marginBottom: 64 }}>
            <textarea
              ref={textAreaRef}
              value={draft} onChange={e => { setDraft(e.target.value); }}
              onInput={e => adjustTextareaHeight(e.currentTarget)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t.sos.chatPlaceholder}
              rows={1}
              style={{ flex: 1, minHeight: 40, maxHeight: 120, overflowY: "auto", background: "#fff", border: "1px solid rgba(44,53,49,0.09)", borderRadius: 20, padding: "12px 14px", fontSize: 14, color: "#2C3531", resize: "none", outline: "none", fontFamily: "var(--font-family)", lineHeight: 1.5 }}
              onFocus={e => (e.target.style.borderColor = "#4A6B5D")}
              onBlur={e => (e.target.style.borderColor = "rgba(44,53,49,0.09)")}
            />
            <button onClick={send}
              style={{ width: 42, height: 42, borderRadius: "50%", background: draft.trim() ? "#4A6B5D" : "#E8EDEA", border: "none", cursor: draft.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
            >
              <Send size={15} strokeWidth={1.8} color={draft.trim() ? "#fff" : "#B5C5BE"} />
            </button>
          </div>
        </div>

        <MobileNav />
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-family)" }}>
      <Sidebar />
      <style>{animations}</style>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <header style={{ height: 68, borderBottom: "1px solid rgba(44,53,49,0.08)", padding: "0 36px", display: "flex", alignItems: "center", flexShrink: 0, background: "linear-gradient(150deg,#EFF4F1,#F5F3EE 60%,#EEF0F4)" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{t.sos.title}</p>
            <p style={{ fontSize: 12, color: "#7A8A84", marginTop: 1 }}>{t.sos.subtitle}</p>
          </div>
        </header>

        <div style={{ flex: 1, background: "linear-gradient(150deg,#EFF4F1 0%,#F5F3EE 55%,#EEF0F4 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", padding: "38px 36px 24px", gap: 0, alignItems: "start", minHeight: 0 }}>

            {/* Left: breathing */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingRight: 36, borderRight: "1px solid rgba(44,53,49,0.07)" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 34, textAlign: "center" }}>{t.sos.breathingAnchor}</p>

              <div style={{ position: "relative", width: 290, height: 290, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(74,107,93,0.11)" }} />
                {started && (
                  <div style={{ position: "absolute", width: 252, height: 252, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,107,93,0.17) 0%,rgba(74,107,93,0) 70%)", animation: "aura 4s ease-in-out infinite" }} />
                )}

                {completed ? (
                  /* Completion bubble */
                  <div style={{ width: 194, height: 194, borderRadius: "50%", background: "radial-gradient(circle at 38% 38%,#7EA896 0%,#4A6B5D 100%)", boxShadow: "0 10px 48px rgba(74,107,93,0.24)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 1 }}>
                    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)", letterSpacing: "0.01em" }}>{t.sos.complete}</p>
                  </div>
                ) : started ? (
                  /* Active bubble */
                  <div
                    key={`${phase.label}-${pidx}`}
                    style={{
                      width: 194, height: 194, borderRadius: "50%",
                      background: "radial-gradient(circle at 38% 38%,#7EA896 0%,#4A6B5D 100%)",
                      boxShadow: "0 10px 48px rgba(74,107,93,0.24),0 2px 10px rgba(74,107,93,0.14)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, zIndex: 1,
                      animation: isInhale ? `breathIn ${phase.dur}s ease-in forwards`
                        : isExhale ? `breathOut ${phase.dur}s ease-out forwards` : "none",
                      transform: isHold ? "scale(1.28)" : (!isInhale && !isExhale) ? "scale(1.0)" : undefined,
                    }}
                  >
                    <p style={{ fontSize: 19, fontWeight: 500, color: "#fff", letterSpacing: "-0.01em" }}>{PHASE_LABELS[phase.label] ?? phase.label}</p>
                    <p style={{ fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.04em", lineHeight: 1 }}>{secs}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{t.sos.seconds}</p>
                  </div>
                ) : (
                  /* Idle — click to start */
                  <button onClick={start} style={{
                    width: 194, height: 194, borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 38%,#8FB8A8 0%,#4A6B5D 100%)",
                    boxShadow: "0 10px 44px rgba(74,107,93,0.20)",
                    border: "none", cursor: "pointer", zIndex: 1,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 52px rgba(74,107,93,0.34)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 44px rgba(74,107,93,0.20)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="rgba(255,255,255,0.92)">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.95)", letterSpacing: "0.01em" }}>{t.sos.startBreathing}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>{t.sos.pattern}</p>
                  </button>
                )}
              </div>

              {/* Round badge + phase dots */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, marginBottom: 26 }}>
                {started && !completed && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4A6B5D", background: "rgba(74,107,93,0.1)", borderRadius: 20, padding: "3px 13px", letterSpacing: "0.04em" }}>
                    {t.sos.round} {round} {t.sos.of} {MAX_ROUNDS}
                  </span>
                )}
                <div style={{ display: "flex", gap: 7, opacity: started && !completed ? 1 : 0, transition: "opacity 0.4s" }}>
                  {PHASES.map((p, i) => (
                    <div key={p.label} style={{ height: 4, width: i === pidx ? 24 : 7, borderRadius: 4, background: i === pidx ? "#4A6B5D" : "rgba(74,107,93,0.2)", transition: "all 0.35s" }} />
                  ))}
                </div>
              </div>

              {/* Step list / completion card */}
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 18, padding: "17px 20px", maxWidth: 310, width: "100%", backdropFilter: "blur(8px)" }}>
                {completed ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "4px 0" }}>
                    <p style={{ fontSize: 14, color: "#3A4B44", textAlign: "center", lineHeight: 1.7 }}>
                      {t.sos.wellDone}
                    </p>
                    <button onClick={restart} style={{ fontSize: 12, fontWeight: 500, color: "#4A6B5D", background: "rgba(74,107,93,0.1)", border: "none", borderRadius: 20, padding: "6px 18px", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,107,93,0.18)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,107,93,0.1)"}
                    >
                      {t.sos.restart}
                    </button>
                  </div>
                ) : started ? (
                  PHASES.filter(p => p.label !== "Rest").map((p, i) => {
                    const on = phase.label === p.label;
                    return (
                      <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 11 : 0 }}>
                        <div style={{ width: 25, height: 25, borderRadius: "50%", background: on ? "#4A6B5D" : "#E8EDEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: on ? "#fff" : "#7A8A84" }}>{i + 1}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: on ? 500 : 400, color: on ? "#2C3531" : "#7A8A84", transition: "all 0.3s" }}>
                          {STEP_COPY[p.label]} <span style={{ fontSize: 11, color: "#9AA8A2" }}>· {p.dur}s</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  PHASES.filter(p => p.label !== "Rest").map((p, i) => (
                    <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 11 : 0 }}>
                      <div style={{ width: 25, height: 25, borderRadius: "50%", background: "#E8EDEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#7A8A84" }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 13, color: "#B5C5BE" }}>
                        {STEP_COPY[p.label]} <span style={{ fontSize: 11, color: "#C8D8D0" }}>· {p.dur}s</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: chat */}
            <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", height: "calc(100vh - 68px - 112px)", minHeight: 360 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 16 }}>{t.sos.aiAssistant}</p>

              <div style={{ flex: 1, background: "rgba(255,255,255,0.6)", borderRadius: 22, border: "1px solid rgba(44,53,49,0.08)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
                  {/* Session marker */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#EAF2EE", borderRadius: 20, padding: "4px 12px" }}>
                      <Heart size={10} strokeWidth={2} color="#4A6B5D" />
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#4A6B5D" }}>{t.sos.always}</span>
                    </div>
                  </div>

                  {msgs.map(m => {
                    const isAI = m.from === "ai";
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 9, maxWidth: "80%" }}>
                          {isAI && (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                              <Heart size={11} strokeWidth={2} color="#fff" />
                            </div>
                          )}
                          <div style={{
                            background: isAI ? "#F2F7F4" : "#EDF0EE",
                            borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                            padding: "12px 16px",
                            boxShadow: "0 1px 3px rgba(44,53,49,0.06)",
                            border: isAI ? "1px solid rgba(74,107,93,0.1)" : "1px solid rgba(44,53,49,0.08)",
                          }}>
                            <p style={{ fontSize: 13, lineHeight: 1.75, color: "#2C3531" }}>{m.text}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 10, color: "#9AA8A2", paddingLeft: isAI ? 37 : 0, paddingRight: isAI ? 0 : 4 }}>{m.time}</span>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <div style={{ borderTop: "1px solid rgba(44,53,49,0.07)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end", background: "rgba(255,255,255,0.75)", flexShrink: 0 }}>
                  <textarea
                    value={draft} onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={t.sos.chatPlaceholderDesktop}
                    rows={2}
                    style={{ flex: 1, background: "#F4F7F5", border: "1px solid rgba(44,53,49,0.09)", borderRadius: 12, padding: "8px 12px", fontSize: 13, color: "#2C3531", resize: "none", outline: "none", fontFamily: "var(--font-family)", lineHeight: 1.6 }}
                    onFocus={e => (e.target.style.borderColor = "#4A6B5D")}
                    onBlur={e => (e.target.style.borderColor = "rgba(44,53,49,0.09)")}
                  />
                  <button onClick={send}
                    style={{ width: 38, height: 38, borderRadius: "50%", background: draft.trim() ? "#4A6B5D" : "#E8EDEA", border: "none", cursor: draft.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", marginBottom: 2 }}
                  >
                    <Send size={14} strokeWidth={1.8} color={draft.trim() ? "#fff" : "#B5C5BE"} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 36px 28px", flexShrink: 0 }}>
            <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,107,93,0.11)", backdropFilter: "blur(8px)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A6B5D", opacity: 0.5, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#3A4B44", textAlign: "center", lineHeight: 1.65, fontStyle: "italic" }}>
                {t.sos.waveBanner}
              </p>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A6B5D", opacity: 0.5, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
