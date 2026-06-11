import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { LanguageSelector } from "../components/LanguageSelector";
import { CheckCard } from "../components/CheckCard";
import { StartNewSessionButton } from "../components/StartNewSessionButton";
import { AddCheckModal } from "../components/AddCheckModal";
import { VoiceNoteRecorder } from "../components/VoiceNoteRecorder";
import { SettingsPopover } from "../components/SettingsPopover";
import { useUnifiedCards } from "../contexts/UnifiedCardsContext";
import { useMetrics } from "../contexts/MetricsContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { getIconById } from "../utils/iconMapping";
import { useLang } from "../contexts/LangContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import {
  DoorOpen, Flame, AppWindow, Lightbulb,
  CheckCircle2, Clock, Search, Shield,
  Camera, X, Trash2,
  HeartPulse, Settings, Settings2, ChevronRight, Plus, Leaf,
  Plug, Droplets, Car, Zap,
} from "lucide-react";


const HOLD_MS = 3000;

/* ─── AnchorPanel Component ─── */
function AnchorPanel({ onClose, onDelete, cardLabel, initialSecured, initialPhoto, initialAudio, onComplete, onProofConsulted, onSavePhoto, onSaveAudio }: { onClose: () => void; onDelete: () => void; cardLabel?: string; initialSecured?: boolean; initialPhoto?: string; initialAudio?: string; onComplete: () => void; onProofConsulted: () => void; onSavePhoto: (data: string) => void; onSaveAudio: (data: string) => void; }) {
  const { t } = useLang();
  const tv = t.vault;
  const [holding,  setHolding]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [secured,  setSecured]  = useState(initialSecured ?? false);
  const [photoData, setPhotoData] = useState<string | null>(initialPhoto ?? null);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t0Ref = useRef(0);
  const photoRef = useRef<HTMLInputElement>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPhotoData(data);
      onSavePhoto(data);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() { setPhotoData(null); onSavePhoto(""); }

  function startHold() {
    if (secured) return;
    setHolding(true);
    t0Ref.current = Date.now();
    ivRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - t0Ref.current) / HOLD_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(ivRef.current!);
        setHolding(false);
        setSecured(true);
        // After securing, update card status and close panel
        setTimeout(() => {
          onComplete();
          onClose();
        }, 500);
      }
    }, 30);
  }
  function cancelHold() {
    if (secured) return;
    clearInterval(ivRef.current!);
    setHolding(false); setProgress(0);
  }

  const C = 2 * Math.PI * 48;

  return (
    <div style={{ height: "100%", background: "#F8FAF8", display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: "1px solid rgba(44,53,49,0.08)" }}>
      <div style={{ padding: "22px 22px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 4 }}>{tv.mindfulAnchor}</p>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{cardLabel ?? ""}</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={onDelete} style={{ background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 9, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Trash2 size={13} strokeWidth={2} color="#ef4444" />
          </button>
          <button onClick={onClose} style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 9, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={13} strokeWidth={2} color="#7A8A84" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 22px 22px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 28 }}>
          <div style={{ position: "relative", width: 132, height: 132, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
            <svg width={132} height={132} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx={66} cy={66} r={48} fill="none" stroke="#E8EDEA" strokeWidth={7} />
              {(holding || secured) && (
                <circle cx={66} cy={66} r={48} fill="none"
                  stroke={secured ? "#4A9B6F" : "#4A6B5D"} strokeWidth={7} strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={secured ? 0 : C * (1 - progress / 100)}
                  style={{ transition: secured ? "stroke-dashoffset 0.3s" : "none" }}
                />
              )}
            </svg>
            <button
              onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
              onTouchStart={e => { e.preventDefault(); startHold(); }} onTouchEnd={cancelHold}
              style={{
                width: 98, height: 98, borderRadius: "50%",
                background: secured ? "linear-gradient(135deg,#4A9B6F,#3A7A52)" : "#4A6B5D",
                border: "none", cursor: secured ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: holding ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.15s, background 0.3s",
                boxShadow: holding ? "0 0 0 8px rgba(74,107,93,0.12)" : "0 6px 22px rgba(74,107,93,0.28)",
                touchAction: "none",
              }}
            >
              {secured ? <CheckCircle2 size={26} color="#fff" strokeWidth={1.7} /> : <Shield size={22} color="#fff" strokeWidth={1.5} />}
            </button>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: secured ? "#3A7A52" : "#2C3531", textAlign: "center", lineHeight: 1.5, maxWidth: 190 }}>
            {secured ? tv.secured : holding ? `${tv.holdProgress} ${Math.round(progress)}%` : tv.holdInstruction}
          </p>
          {!secured && <p style={{ fontSize: 11, color: "#7A8A84", textAlign: "center", marginTop: 3 }}>{tv.slowDown}</p>}
        </div>

        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 11 }}>{tv.header}</p>

        {/* Hidden file input */}
        <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />

        {/* Photo card */}
        {photoData ? (
          <div style={{ position: "relative", width: "100%", boxSizing: "border-box", borderRadius: 14, height: 108, overflow: "hidden", marginBottom: 10, cursor: "pointer" }} onClick={() => photoRef.current?.click()}>
            <img src={photoData} alt="Evidence photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0, transition: "opacity 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
            >
              <Camera size={16} color="#fff" strokeWidth={1.6} />
              <span style={{ fontSize: 11, color: "#fff" }}>{tv.tapReplace}</span>
              <button onClick={e => { e.stopPropagation(); clearPhoto(); }} style={{ background: "rgba(239,68,68,0.75)", border: "none", borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Trash2 size={11} color="#fff" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => photoRef.current?.click()} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, height: 108, background: "#F2F5F3", border: "1.5px dashed rgba(44,53,49,0.13)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", outline: "none", marginBottom: 10, transition: "background 0.15s, border-color 0.15s", padding: "0 18px" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EBF2EE"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F2F5F3"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,53,49,0.13)"; }}
          >
            <Camera size={20} strokeWidth={1.4} color="#A8BCAF" />
            <span style={{ fontSize: 11, color: "#A8BCAF", letterSpacing: "0.01em", lineHeight: 1.4, textAlign: "center", width: "100%" }}>{tv.noPhoto}</span>
          </button>
        )}

        <VoiceNoteRecorder initialAudio={initialAudio} onSave={onSaveAudio} />
      </div>
    </div>
  );
}

/* ─── Mobile bottom-sheet wrapper ─── */
function MobileAnchorSheet({ cardLabel, initialSecured, initialPhoto, initialAudio, onClose, onComplete, onProofConsulted, onSavePhoto, onSaveAudio }: { cardLabel: string; initialSecured?: boolean; initialPhoto?: string; initialAudio?: string; onClose: () => void; onComplete: () => void; onProofConsulted: () => void; onSavePhoto: (data: string) => void; onSaveAudio: (data: string) => void; }) {
  const { t } = useLang();
  const tv = t.vault;
  const [holding,  setHolding]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [secured,  setSecured]  = useState(initialSecured ?? false);
  const [photoData, setPhotoData] = useState<string | null>(initialPhoto ?? null);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t0Ref = useRef(0);
  const photoRef = useRef<HTMLInputElement>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPhotoData(data);
      onSavePhoto(data);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() { setPhotoData(null); onSavePhoto(""); }

  function startHold() {
    if (secured) return;
    setHolding(true);
    t0Ref.current = Date.now();
    ivRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - t0Ref.current) / HOLD_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(ivRef.current!);
        setHolding(false);
        setSecured(true);
        // After securing, update card status and close panel
        setTimeout(() => {
          onComplete();
          onClose();
        }, 500);
      }
    }, 30);
  }
  function cancelHold() {
    if (secured) return;
    clearInterval(ivRef.current!);
    setHolding(false); setProgress(0);
  }

  const C = 2 * Math.PI * 56;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,42,38,0.45)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "#F8FAF8",
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 40px rgba(44,53,49,0.16)",
        maxHeight: "88vh", overflowY: "auto",
        animation: "slideUp 0.28s cubic-bezier(0.34,1.1,0.64,1) both",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: "rgba(44,53,49,0.15)" }} />
        </div>

        {/* Sheet header */}
        <div style={{ padding: "12px 22px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 3 }}>{tv.mindfulAnchor}</p>
            <h3 style={{ fontSize: 20, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{cardLabel}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} strokeWidth={2} color="#7A8A84" />
          </button>
        </div>

        {/* Hold button — large for touch */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 22px 24px" }}>
          <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width={160} height={160} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx={80} cy={80} r={56} fill="none" stroke="#E8EDEA" strokeWidth={8} />
              {(holding || secured) && (
                <circle cx={80} cy={80} r={56} fill="none"
                  stroke={secured ? "#4A9B6F" : "#4A6B5D"} strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={secured ? 0 : C * (1 - progress / 100)}
                  style={{ transition: secured ? "stroke-dashoffset 0.3s" : "none" }}
                />
              )}
            </svg>
            <button
              onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
              onTouchStart={e => { e.preventDefault(); startHold(); }} onTouchEnd={cancelHold}
              style={{
                width: 118, height: 118, borderRadius: "50%",
                background: secured ? "linear-gradient(135deg,#4A9B6F,#3A7A52)" : "#4A6B5D",
                border: "none", cursor: secured ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: holding ? "scale(0.94)" : "scale(1)",
                transition: "transform 0.15s, background 0.3s",
                boxShadow: holding ? "0 0 0 12px rgba(74,107,93,0.12)" : "0 8px 28px rgba(74,107,93,0.30)",
                touchAction: "none",
              }}
            >
              {secured ? <CheckCircle2 size={32} color="#fff" strokeWidth={1.7} /> : <Shield size={28} color="#fff" strokeWidth={1.5} />}
            </button>
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: secured ? "#3A7A52" : "#2C3531", textAlign: "center", lineHeight: 1.55, maxWidth: 240 }}>
            {secured ? tv.secured : holding ? `${tv.holdProgress} ${Math.round(progress)}%` : tv.holdInstruction}
          </p>
          {!secured && <p style={{ fontSize: 12, color: "#7A8A84", textAlign: "center", marginTop: 4 }}>{tv.slowDown}</p>}
        </div>

        {/* Evidence vault (compact) */}
        <div style={{ padding: "0 22px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 11 }}>{tv.header}</p>

          {/* Hidden file input */}
          <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />

          {/* Photo card */}
          {photoData ? (
            <div style={{ position: "relative", width: "100%", boxSizing: "border-box", borderRadius: 14, height: 112, overflow: "hidden", marginBottom: 10, cursor: "pointer" }} onClick={() => photoRef.current?.click()}>
              <img src={photoData} alt="Evidence photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Camera size={18} color="#fff" strokeWidth={1.6} />
                <span style={{ fontSize: 12, color: "#fff" }}>{tv.tapReplace}</span>
                <button onClick={e => { e.stopPropagation(); clearPhoto(); }} style={{ background: "rgba(239,68,68,0.75)", border: "none", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Trash2 size={12} color="#fff" strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => photoRef.current?.click()} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, height: 112, background: "#F2F5F3", border: "1.5px dashed rgba(44,53,49,0.13)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", outline: "none", marginBottom: 10, padding: "0 20px" }}>
              <Camera size={22} strokeWidth={1.4} color="#A8BCAF" />
              <span style={{ fontSize: 11, color: "#A8BCAF", lineHeight: 1.45, textAlign: "center", width: "100%" }}>{tv.noPhoto}</span>
            </button>
          )}

          <VoiceNoteRecorder initialAudio={initialAudio} onSave={onSaveAudio} bordered />
        </div>
      </div>
    </>
  );
}

/* ─── Page ─── */
export function Dashboard() {
  const [active, setActive] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cards, updateCardStatus, updateCard, addCard, removeCard } = useUnifiedCards();
  const { addMindfulMoments, addProofConsulted, setSecuredTotal } = useMetrics();
  const isMobile = useIsMobile();
  const nav = useNavigate();
  const { t } = useLang();
  const { userName } = useUserProfile();
  const avatar = userName ? userName.charAt(0).toUpperCase() : "A";

  const allCards = useMemo(() => {
    return cards
      .filter((card) => card.isActive)
      .map((card) => ({
        id: card.id,
        icon: getIconById(card.iconId),
        label: card.label,
        isCustom: card.isCustom,
        status: card.status,
        photoData: card.photoData,
        audioData: card.audioData,
      }));
  }, [cards]);

  const cardMap = t.cards as Record<string, { label: string; desc: string } | undefined>;
  function tlabel(id: string, label: string, isCustom: boolean): string {
    if (isCustom) return label;
    return cardMap[id]?.label ?? label;
  }

  const savePhoto = useCallback((data: string) => {
    if (active) updateCard(active, { photoData: data || undefined });
  }, [active, updateCard]);

  const saveAudio = useCallback((data: string) => {
    if (active) updateCard(active, { audioData: data || undefined });
  }, [active, updateCard]);

  const activeCard = allCards.find(c => c.id === active);

  const filteredCards = searchQuery.trim()
    ? allCards.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allCards;

  // Keep securedActions in sync: total = active cards, completed = secured cards
  useEffect(() => {
    const total = allCards.length;
    const done = allCards.filter(c => c.status === "Secure").length;
    setSecuredTotal(total, done);
  }, [allCards]);

  function handleCardComplete() {
    if (!active) return;
    updateCardStatus(active, "Secure");
    addMindfulMoments(3);
  }

  function handleCardOpen(id: string) {
    if (active === id) {
      setActive(null);
      return;
    }
    const card = cards.find(c => c.id === id);
    const hasPhoto = !!(card?.photoData && card.photoData.length > 0);
    const hasAudio = !!(card?.audioData && card.audioData.length > 0);
    if (hasPhoto) addProofConsulted();
    if (hasAudio) addProofConsulted();
    setActive(id);
  }

  function handleDeleteCard() {
    if (!active) return;
    removeCard(active);
    setActive(null);
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * FORM SUBMISSION HANDLER
   * Receives data from AddCheckModal and creates new card
   * ════════════════════════════════════════════════════════════════
   *
   * EXECUTION FLOW:
   * 1. Modal collects user input (label, description, iconId)
   * 2. Modal calls this function with form data
   * 3. This function creates card object with unique ID
   * 4. Card is added to cards array (via context)
   * 5. Context automatically persists to localStorage ("memento_cards")
   * 6. Modal closes and clears form
   * 7. New card appears in grid immediately
   * 8. Routines page automatically sees the new card
   */
  function handleAddCard(data: { label: string; description: string; iconId: string }) {
    // Create new card and persist to localStorage
    addCard({
      label: data.label,
      description: data.description,
      iconId: data.iconId,
    });

    // Card is now:
    // ✓ Added to cards array with unique ID
    // ✓ Saved to localStorage ("memento_cards" key)
    // ✓ Available in allCards array
    // ✓ Rendered in the card grid
    // ✓ Has default status "Pending"
    // ✓ Visible in Routines page automatically
  }

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: "#FBFBF9", fontFamily: "var(--font-family)", display: "flex", flexDirection: "column" }}>
        {/* Mobile header */}
        <header style={{ padding: "16px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(44,53,49,0.08)", background: "#FBFBF9", position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={13} color="#fff" strokeWidth={1.9} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.025em" }}>Memento</span>
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
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{avatar}</span>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 18px", paddingBottom: 96 }}>
          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 22, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.03em", marginBottom: 4 }}>{t.dashboard.greeting}, {userName || "Alex"}.</p>
            <p style={{ fontSize: 13, color: "#7A8A84", lineHeight: 1.5 }}>{t.dashboard.subtitle}</p>
          </div>

          {/* Quick-Check Overview */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 4 }}>{t.dashboard.overviewTitle}</p>
          <p style={{ fontSize: 12, color: "#7A8A84", marginBottom: 14 }}>{t.dashboard.overviewSub}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {filteredCards.length === 0 && searchQuery.trim() && (
              <p style={{ fontSize: 13, color: "#B5C5BE", fontFamily: "var(--font-family)", textAlign: "center", padding: "12px 0" }}>{t.dashboard.noResults}</p>
            )}
            {filteredCards.map(({ id, icon, label, isCustom, status }) => {
              const on = active === id;
              const isPending = status === "Pending";
              const dispLabel = tlabel(id, label, isCustom);
              return (
                <button key={id} onClick={() => handleCardOpen(id)}
                  style={{
                    width: "100%", textAlign: "left",
                    background: on ? "#F0F6F3" : "#fff",
                    border: on ? "1.5px solid #4A6B5D" : "1px solid rgba(44,53,49,0.1)",
                    borderRadius: 18, padding: "16px 18px",
                    cursor: "pointer", outline: "none",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: on ? "0 4px 16px rgba(74,107,93,0.10)" : "0 1px 3px rgba(44,53,49,0.04)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isPending ? "#FDF3EB" : "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {(() => { const Icon = icon; return <Icon size={18} strokeWidth={1.6} color={isPending ? "#C47A3A" : "#4A6B5D"} />; })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#2C3531", marginBottom: 2, letterSpacing: "-0.01em" }}>{dispLabel}</p>
                    <p style={{ fontSize: 12, color: "#7A8A84" }}>{isPending ? t.dashboard.pending : t.dashboard.secure}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 3, background: isPending ? "#FEF3E2" : "#EAF5EE", color: isPending ? "#B06B20" : "#3A7A52", borderRadius: 20, padding: "3px 9px", flexShrink: 0 }}>
                    {isPending ? <Clock size={10} strokeWidth={2} /> : <CheckCircle2 size={10} strokeWidth={2} />}
                    {status}
                  </span>
                </button>
              );
            })}

            {/* Add custom check */}
            <button
              onClick={() => setModalOpen(true)}
              style={{ width: "100%", background: "transparent", border: "1.5px dashed rgba(74,107,93,0.35)", borderRadius: 18, padding: "16px 18px", cursor: "pointer", outline: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.65)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,107,93,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.35)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,107,93,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.65)"; }}
              onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.35)"; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, border: "1.5px dashed rgba(74,107,93,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={16} strokeWidth={1.8} color="#4A6B5D" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#4A6B5D" }}>{t.dashboard.addCheck}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 12 }}>{t.dashboard.quickActions}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => nav("/sos")}
              style={{ width: "100%", background: "linear-gradient(135deg,#4A6B5D,#3A5A4D)", border: "none", borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 4px 16px rgba(74,107,93,0.22)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <HeartPulse size={17} color="#fff" strokeWidth={1.6} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 1 }}>{t.dashboard.relief}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{t.dashboard.openSOS}</p>
                </div>
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
            </button>

            <button onClick={() => nav("/routines")}
              style={{ width: "100%", background: "#fff", border: "1px solid rgba(44,53,49,0.1)", borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 1px 3px rgba(44,53,49,0.04)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F3F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Settings2 size={17} color="#4A6B5D" strokeWidth={1.6} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#7A8A84", marginBottom: 1 }}>{t.dashboard.customize}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#2C3531" }}>{t.dashboard.configRoutes}</p>
                </div>
              </div>
              <ChevronRight size={15} color="#B5C5BE" strokeWidth={1.8} />
            </button>

            {/* Session Reset */}
            <div style={{ marginTop: 4 }}>
              <StartNewSessionButton compact label={t.vault.newSession} />
            </div>
          </div>
        </div>

        {/* Bottom sheet (Mindful Anchor) */}
        {active && activeCard && (
          <MobileAnchorSheet
            key={`${active}-${activeCard.status}-${activeCard.photoData ?? ""}-${activeCard.audioData ?? ""}`}
            cardLabel={activeCard.label}
            initialSecured={activeCard.status === "Secure"}
            initialPhoto={activeCard.photoData}
            initialAudio={activeCard.audioData}
            onClose={() => setActive(null)}
            onComplete={handleCardComplete}
            onProofConsulted={addProofConsulted}
            onSavePhoto={savePhoto}
            onSaveAudio={saveAudio}
          />
        )}

        {modalOpen && (
          <AddCheckModal
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddCard}
          />
        )}

        <MobileNav />
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FBFBF9", fontFamily: "var(--font-family)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        <header style={{ height: 68, borderBottom: "1px solid rgba(44,53,49,0.08)", padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#FBFBF9" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{t.dashboard.greeting}, {userName || "Alex"}.</p>
            <p style={{ fontSize: 12, color: "#7A8A84", marginTop: 1 }}>{t.dashboard.subtitle}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0F3F1", borderRadius: 12, padding: "8px 15px" }}>
            <Search size={13} color="#7A8A84" strokeWidth={1.8} />
            <input placeholder={t.dashboard.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#2C3531", width: 170, fontFamily: "var(--font-family)" }} />
          </div>
        </header>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: active ? "1fr 330px" : "1fr", overflowY: "auto", alignItems: "start" }}>
          <div style={{ padding: "30px 36px", minWidth: 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 4 }}>{t.dashboard.overviewTitle}</h2>
            <p style={{ fontSize: 13, color: "#7A8A84", marginBottom: 20 }}>{t.dashboard.overviewSub}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 13, marginBottom: 30 }}>
              {filteredCards.length === 0 && searchQuery.trim() && (
                <p style={{ fontSize: 13, color: "#B5C5BE", fontFamily: "var(--font-family)", padding: "8px 0" }}>{t.dashboard.noResults}</p>
              )}
              {filteredCards.map(({ id, icon, label, isCustom, status }) => (
                <CheckCard
                  key={id}
                  id={id}
                  icon={icon}
                  label={tlabel(id, label, isCustom)}
                  status={status}
                  isActive={active === id}
                  onSelect={() => handleCardOpen(id)}
                  compact={false}
                />
              ))}

              {/* Add custom check card */}
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  flex: "1 1 190px", minWidth: 180,
                  background: "transparent",
                  border: "1.5px dashed rgba(74,107,93,0.35)",
                  borderRadius: 20, padding: "20px 20px",
                  cursor: "pointer", outline: "none",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "border-color 0.15s, background 0.15s",
                  minHeight: 110,
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(74,107,93,0.65)";
                  b.style.background = "rgba(74,107,93,0.06)";
                  b.querySelector<HTMLSpanElement>("span")!.style.color = "#4A6B5D";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(74,107,93,0.35)";
                  b.style.background = "transparent";
                  b.querySelector<HTMLSpanElement>("span")!.style.color = "#7A8A84";
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px dashed rgba(74,107,93,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={18} strokeWidth={1.8} color="#4A6B5D" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#7A8A84", letterSpacing: "-0.01em", transition: "color 0.15s" }}>{t.dashboard.addCheck}</span>
              </button>
            </div>

            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 13 }}>{t.dashboard.quickActions}</h2>
            <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
              <button onClick={() => nav("/sos")}
                style={{ flex: "1 1 220px", background: "linear-gradient(135deg,#4A6B5D,#3A5A4D)", border: "none", borderRadius: 18, padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 4px 16px rgba(74,107,93,0.22)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HeartPulse size={18} color="#fff" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{t.dashboard.relief}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{t.dashboard.openSOS}</p>
                  </div>
                </div>
                <ChevronRight size={15} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
              </button>

              <button onClick={() => nav("/routines")}
                style={{ flex: "1 1 220px", background: "#fff", border: "1px solid rgba(44,53,49,0.1)", borderRadius: 18, padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 1px 3px rgba(44,53,49,0.04)", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(44,53,49,0.08)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(44,53,49,0.04)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "#F0F3F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Settings2 size={18} color="#4A6B5D" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#7A8A84", marginBottom: 2 }}>{t.dashboard.customize}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#2C3531" }}>{t.dashboard.configRoutes}</p>
                  </div>
                </div>
                <ChevronRight size={15} color="#B5C5BE" strokeWidth={1.8} />
              </button>

              {/* Session Reset - Full width on new row */}
              <div style={{ flex: "1 1 100%", marginTop: 4 }}>
                <StartNewSessionButton label={t.vault.newSession} />
              </div>
            </div>
          </div>

          {active && (
            <div style={{ position: "sticky", top: 0, height: "calc(100vh - 68px)" }}>
              <AnchorPanel
                key={`${active}-${activeCard?.status}-${activeCard?.photoData ?? ""}-${activeCard?.audioData ?? ""}`}
                onClose={() => setActive(null)}
                onDelete={handleDeleteCard}
                cardLabel={activeCard?.label}
                initialSecured={activeCard?.status === "Secure"}
                initialPhoto={activeCard?.photoData}
                initialAudio={activeCard?.audioData}
                onComplete={handleCardComplete}
                onProofConsulted={addProofConsulted}
                onSavePhoto={savePhoto}
                onSaveAudio={saveAudio}
              />
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
          <AddCheckModal
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddCard}
          />
        )}
    </div>
  );
}
