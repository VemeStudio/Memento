import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useLang } from "../contexts/LangContext";
import { useIsMobile } from "../hooks/useIsMobile"; // <-- L'astuce est là !

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: on ? "#4A6B5D" : "#D4DDD9",
        position: "relative", flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

export function SettingsPopover({ onClose, direction = "up" }: { onClose: () => void; direction?: "up" | "down" }) {
  const { userName, userStatus, saveProfile } = useUserProfile();
  const { t } = useLang();
  const isMobile = useIsMobile(); // On récupère l'info PC/Mobile

  const STATUS_OPTIONS = [
    { key: "mindful", label: t.status.mindful },
    { key: "ontrack", label: t.status.ontrack },
    { key: "slow",    label: t.status.slow    },
    { key: "strong",  label: t.status.strong  },
  ];

  const [draftName,   setDraftName]   = useState(userName);
  const [draftStatus, setDraftStatus] = useState(userStatus);
  const [reminders,   setReminders]   = useState(true);
  const [saved,       setSaved]       = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Le setTimeout (10ms) empêche le menu de se refermer instantanément 
    // à cause du clic initial sur le bouton d'ouverture.
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 10);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  function save() {
    saveProfile(draftName.trim() || userName, draftStatus);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  return (
    <div
      ref={popoverRef}
      style={{
        // --- LA MAGIE EST ICI ---
        ...(isMobile
          ? { position: "fixed", top: 70, right: 20, width: "calc(100vw - 40px)", maxWidth: 320 } // Mobile : Fixé en haut à droite, sous le header
          : { position: "absolute", bottom: "calc(100% + 10px)", left: 10, right: 10 }            // PC : Ancré au dessus du bouton
        ),
        // ------------------------
        background: "#FAFCFA",
        borderRadius: 14,
        border: "1px solid rgba(44,53,49,0.10)",
        boxShadow: "0 8px 32px rgba(44,53,49,0.14), 0 2px 8px rgba(44,53,49,0.08)",
        padding: "18px 16px 16px",
        zIndex: 9999, // On s'assure qu'il passe devant TOUT le reste
        animation: "popIn 0.18s cubic-bezier(0.34,1.2,0.64,1) both",
      }}
    >
      <style>{`@keyframes popIn { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.01em" }}>{t.sidebar.editProfile}</p>
        <button onClick={onClose} style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={11} strokeWidth={2.2} color="#7A8A84" />
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#7A8A84", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{t.sidebar.name}</label>
        <input
          value={draftName} onChange={e => setDraftName(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(44,53,49,0.12)", background: "#fff", fontSize: 13, color: "#2C3531", outline: "none", fontFamily: "var(--font-family)", boxSizing: "border-box", transition: "border-color 0.15s" }}
          onFocus={e => (e.target.style.borderColor = "#4A6B5D")}
          onBlur={e => (e.target.style.borderColor = "rgba(44,53,49,0.12)")}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#7A8A84", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{t.sidebar.status}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STATUS_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setDraftStatus(key)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, border: draftStatus === key ? "1.5px solid #4A6B5D" : "1px solid rgba(44,53,49,0.1)", background: draftStatus === key ? "#EFF7F3" : "#fff", cursor: "pointer", outline: "none", transition: "all 0.12s" }}
            >
              <span style={{ fontSize: 12, fontWeight: draftStatus === key ? 500 : 400, color: draftStatus === key ? "#2C3531" : "#7A8A84" }}>{label}</span>
              {draftStatus === key && <Check size={11} strokeWidth={2.5} color="#4A6B5D" />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(44,53,49,0.07)", marginBottom: 14 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#2C3531", lineHeight: 1.2 }}>{t.sidebar.reminders}</p>
            <p style={{ fontSize: 10, color: "#9AA8A2", marginTop: 1 }}>{t.sidebar.remindersSub}</p>
          </div>
          <Toggle on={reminders} onChange={() => setReminders(p => !p)} />
        </div>
      </div>

      <button onClick={save}
        style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: saved ? "#4A9B6F" : "#4A6B5D", color: "#fff", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        {saved ? <><Check size={13} strokeWidth={2.5} /> {t.sidebar.saved}</> : t.sidebar.save}
      </button>
    </div>
  );
}