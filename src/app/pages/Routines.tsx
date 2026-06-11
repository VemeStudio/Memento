import { useState, useMemo } from "react";
import { Sidebar } from "../components/Sidebar";
import { LanguageSelector } from "../components/LanguageSelector";
import { MobileNav } from "../components/MobileNav";
import { useIsMobile } from "../hooks/useIsMobile";
import { useUnifiedCards } from "../contexts/UnifiedCardsContext";
import { getIconById } from "../utils/iconMapping";
import { useLang } from "../contexts/LangContext";
import {
  Check, Plus, Leaf, Trash2,
} from "lucide-react";


/**
 * ════════════════════════════════════════════════════════════════
 * ROUTINES PAGE
 * Dynamically reads cards from the SAME localStorage key ("memento_cards")
 * Auto-updates when cards are added, deleted, or reset from Dashboard
 * ════════════════════════════════════════════════════════════════
 */
export function Routines() {
  const isMobile = useIsMobile();
  const { t } = useLang();

  /**
   * Read cards from unified context (which reads from localStorage)
   * This automatically stays in sync with Dashboard changes
   */
  const { cards, toggleCardVisibility, saveActiveItems, removeCard } = useUnifiedCards();

  /**
   * Transform cards array into format needed for this page
   * Automatically re-computes when cards array changes
   */
  const cardMap = t.cards as Record<string, { label: string; desc: string } | undefined>;
  function tlabel(id: string, label: string, isCustom: boolean): string {
    if (isCustom) return label;
    return cardMap[id]?.label ?? label;
  }
  function tdesc(id: string, desc: string, isCustom: boolean): string {
    if (isCustom) return desc;
    return cardMap[id]?.desc ?? desc;
  }

  const ITEMS = useMemo(() => {
    return cards.map((card) => ({
      id: card.id,
      icon: getIconById(card.iconId),
      label: card.label,
      desc: card.description || "Check trigger status",
      isCustom: card.isCustom,
    }));
  }, [cards]);


  const [routineName, setRoutineName] = useState("");
  const [savedRoutineName, setSavedRoutineName] = useState<string>(() =>
    localStorage.getItem("memento_routine_name") ?? ""
  );
  const [selItems, setSelItems] = useState<string[]>(() =>
    cards.filter((c) => c.isActive).map((c) => c.id)
  );
  const [saved, setSaved] = useState(false);

  function toggle(id: string)     { toggleCardVisibility(id); }
  function toggleItem(id: string) { setSelItems(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  const activeItems = selItems;

  function handleSaveRoutine() {
    if (selItems.length === 0) return;
    saveActiveItems(selItems);
    if (routineName.trim()) {
      setSavedRoutineName(routineName.trim());
      localStorage.setItem("memento_routine_name", routineName.trim());
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setRoutineName(""); }, 1600);
  }

  const canSave = selItems.length > 0;

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100dvh", background: "#FBFBF9", fontFamily: "var(--font-family)", display: "flex", flexDirection: "column" }}>

        {/* Mobile header */}
        <header style={{ padding: "16px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(44,53,49,0.08)", background: "#FBFBF9", position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Leaf size={13} color="#fff" strokeWidth={1.9} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t.routines.title}</p>
              <p style={{ fontSize: 11, color: "#7A8A84" }}>{t.routines.mobileSubtitle}</p>
            </div>
          </div>
          <LanguageSelector compact />
        </header>

        {/* Scrollable body — active checks first, builder below */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", paddingBottom: 96 }}>

          {/* Active trigger checks */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.01em" }}>{savedRoutineName || t.routines.activeChecks}</h2>
            <span style={{ fontSize: 11, color: "#7A8A84", background: "#F0F3F1", padding: "3px 10px", borderRadius: 20 }}>
              {cards.filter(c => c.isActive).length} {t.routines.active}
            </span>
          </div>

          {/* ActiveList */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ITEMS.filter(({ id }) => cards.find(c => c.id === id)?.isActive).map(({ id, icon: Icon, label, desc, isCustom }) => {
              const card = cards.find(c => c.id === id);
              const isSecure = card?.status === "Secure";
              return (
                <div key={id}
                  style={{ background: "#fff", border: "1px solid rgba(44,53,49,0.09)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 13, boxShadow: "0 1px 3px rgba(44,53,49,0.04)" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.6} color="#4A6B5D" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#2C3531", marginBottom: 2 }}>{tlabel(id, label, isCustom)}</p>
                    <p style={{ fontSize: 12, color: "#7A8A84" }}>
                      {tdesc(id, desc, isCustom)}
                      {" - "}
                      <span style={{ color: isSecure ? "#4A9B6F" : "#7A8A84" }}>
                        {isSecure ? t.dashboard.secure : t.dashboard.pending}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeCard(id)}
                    title="Delete"
                    style={{ width: 32, height: 32, borderRadius: 9, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,122,95,0.10)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <Trash2 size={14} strokeWidth={1.7} color="#C07A6A" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ActiveSummary */}
          <div style={{ marginTop: 16, background: "#EEF5F1", borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#3A4B44", marginBottom: 9 }}>{t.routines.activeSummary}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ITEMS.filter(i => cards.find(c => c.id === i.id)?.isActive).map(({ id, icon: Icon, label, isCustom }) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", borderRadius: 20, padding: "4px 11px", border: "1px solid rgba(74,107,93,0.15)" }}>
                  <Icon size={11} strokeWidth={1.7} color="#4A6B5D" />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#4A6B5D" }}>{tlabel(id, label, isCustom)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(44,53,49,0.08)", margin: "24px 0" }} />

          {/* BuilderForm compact */}
          <div style={{ background: "#F8FAF8", borderRadius: 22, padding: "20px 18px", border: "1px solid rgba(44,53,49,0.09)" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 5 }}>{t.routines.builderTag}</p>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 20 }}>{t.routines.builderTitle}</h3>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#2C3531", marginBottom: 7, letterSpacing: "0.01em" }}>{t.routines.routineName}</label>
              <input
                value={routineName} onChange={e => setRoutineName(e.target.value)}
                placeholder={t.routines.routineNameHint}
                style={{ width: "100%", padding: "10px 13px", borderRadius: 11, border: "1px solid rgba(44,53,49,0.1)", background: "#fff", fontSize: 13, color: "#2C3531", outline: "none", fontFamily: "var(--font-family)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                onFocus={e => (e.target.style.borderColor = "#4A6B5D")}
                onBlur={e => (e.target.style.borderColor = "rgba(44,53,49,0.1)")}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#2C3531", marginBottom: 9, letterSpacing: "0.01em" }}>{t.routines.includeChecks}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {ITEMS.map(({ id, icon: Icon, label, isCustom }) => {
                  const sel = selItems.includes(id);
                  return (
                    <button key={id} onClick={() => toggleItem(id)}
                      style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 11, cursor: "pointer", background: sel ? "#EFF7F3" : "#fff", border: sel ? "1.5px solid #4A6B5D" : "1px solid rgba(44,53,49,0.1)", outline: "none", textAlign: "left", transition: "all 0.15s" }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: sel ? "#4A6B5D" : "#F0F3F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                        {sel ? <Check size={12} color="#fff" strokeWidth={2.5} /> : <Icon size={12} strokeWidth={1.6} color="#7A8A84" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: sel ? 500 : 400, color: sel ? "#2C3531" : "#7A8A84" }}>{tlabel(id, label, isCustom)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={handleSaveRoutine}
              style={{ width: "100%", padding: "12px", borderRadius: 13, border: "none", fontSize: 14, fontWeight: 500, cursor: canSave ? "pointer" : "not-allowed", background: saved ? "#4A9B6F" : canSave ? "#4A6B5D" : "#E8EDEA", color: canSave ? "#fff" : "#7A8A84", transition: "background 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
            >
              {saved
                ? <><Check size={14} strokeWidth={2.5} /> {t.routines.routineSaved}</>
                : <><Plus size={14} strokeWidth={2} /> {t.routines.saveRoutine}</>}
            </button>
          </div>
        </div>

        <MobileNav />
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FBFBF9", fontFamily: "var(--font-family)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        <header style={{ height: 68, borderBottom: "1px solid rgba(44,53,49,0.08)", padding: "0 36px", display: "flex", alignItems: "center", flexShrink: 0, background: "#FBFBF9" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{t.routines.title}</p>
            <p style={{ fontSize: 12, color: "#7A8A84", marginTop: 1 }}>{t.routines.subtitle}</p>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "30px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 22, alignItems: "start" }}>

            {/* Left */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.01em" }}>{savedRoutineName || t.routines.activeChecks}</h2>
                <span style={{ fontSize: 12, color: "#7A8A84", background: "#F0F3F1", padding: "3px 10px", borderRadius: 20 }}>
                  {cards.filter(c => c.isActive).length} {t.routines.active}
                </span>
              </div>

              {/* ActiveList */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ITEMS.filter(({ id }) => cards.find(c => c.id === id)?.isActive).map(({ id, icon: Icon, label, desc, isCustom }) => {
                  const card = cards.find(c => c.id === id);
                  const isSecure = card?.status === "Secure";
                  return (
                    <div key={id}
                      style={{ background: "#fff", border: "1px solid rgba(44,53,49,0.09)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 13, boxShadow: "0 1px 3px rgba(44,53,49,0.04)" }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} strokeWidth={1.6} color="#4A6B5D" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#2C3531", marginBottom: 2 }}>{tlabel(id, label, isCustom)}</p>
                        <p style={{ fontSize: 12, color: "#7A8A84" }}>
                          {tdesc(id, desc, isCustom)}
                          {" - "}
                          <span style={{ color: isSecure ? "#4A9B6F" : "#7A8A84" }}>
                            {isSecure ? t.dashboard.secure : t.dashboard.pending}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeCard(id)}
                        title="Delete"
                        style={{ width: 32, height: 32, borderRadius: 9, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,122,95,0.10)"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                      >
                        <Trash2 size={14} strokeWidth={1.7} color="#C07A6A" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ActiveSummary */}
              <div style={{ marginTop: 16, background: "#EEF5F1", borderRadius: 16, padding: "14px 16px" }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#3A4B44", marginBottom: 9 }}>{t.routines.activeSummary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {ITEMS.filter(i => cards.find(c => c.id === i.id)?.isActive).map(({ id, icon: Icon, label, isCustom }) => (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", borderRadius: 20, padding: "4px 11px", border: "1px solid rgba(74,107,93,0.15)" }}>
                      <Icon size={11} strokeWidth={1.7} color="#4A6B5D" />
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#4A6B5D" }}>{tlabel(id, label, isCustom)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: sticky builder */}
            <div style={{ position: "sticky", top: 0 }}>
              <div style={{ background: "#F8FAF8", borderRadius: 22, padding: "24px 22px", border: "1px solid rgba(44,53,49,0.09)" }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 5 }}>{t.routines.builderTag}</p>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.01em", marginBottom: 20 }}>{t.routines.builderTitle}</h3>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#2C3531", marginBottom: 7, letterSpacing: "0.01em" }}>{t.routines.routineName}</label>
                  <input
                    value={routineName} onChange={e => setRoutineName(e.target.value)}
                    placeholder={t.routines.routineNameHint}
                    style={{ width: "100%", padding: "10px 13px", borderRadius: 11, border: "1px solid rgba(44,53,49,0.1)", background: "#fff", fontSize: 13, color: "#2C3531", outline: "none", fontFamily: "var(--font-family)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                    onFocus={e => (e.target.style.borderColor = "#4A6B5D")}
                    onBlur={e => (e.target.style.borderColor = "rgba(44,53,49,0.1)")}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#2C3531", marginBottom: 9, letterSpacing: "0.01em" }}>{t.routines.includeChecks}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {ITEMS.map(({ id, icon: Icon, label, isCustom }) => {
                      const sel = selItems.includes(id);
                      return (
                        <button key={id} onClick={() => toggleItem(id)}
                          style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 11, cursor: "pointer", background: sel ? "#EFF7F3" : "#fff", border: sel ? "1.5px solid #4A6B5D" : "1px solid rgba(44,53,49,0.1)", outline: "none", textAlign: "left", transition: "all 0.15s" }}
                        >
                          <div style={{ width: 26, height: 26, borderRadius: 8, background: sel ? "#4A6B5D" : "#F0F3F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                            {sel ? <Check size={12} color="#fff" strokeWidth={2.5} /> : <Icon size={12} strokeWidth={1.6} color="#7A8A84" />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: sel ? 500 : 400, color: sel ? "#2C3531" : "#7A8A84" }}>{tlabel(id, label, isCustom)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={handleSaveRoutine}
                  style={{ width: "100%", padding: "12px", borderRadius: 13, border: "none", fontSize: 14, fontWeight: 500, cursor: canSave ? "pointer" : "not-allowed", background: saved ? "#4A9B6F" : canSave ? "#4A6B5D" : "#E8EDEA", color: canSave ? "#fff" : "#7A8A84", transition: "background 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  {saved
                    ? <><Check size={14} strokeWidth={2.5} /> {t.routines.routineSaved}</>
                    : <><Plus size={14} strokeWidth={2} /> {t.routines.saveRoutine}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}