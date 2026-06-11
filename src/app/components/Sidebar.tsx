import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { LayoutDashboard, HeartPulse, Trophy, BookMarked, Settings, Leaf, Check, X } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useLang } from "../contexts/LangContext";

const NAV = [
  { icon: LayoutDashboard, key: "dashboard" as const, to: "/"          },
  { icon: Trophy,          key: "victories" as const, to: "/victories" },
  { icon: BookMarked,      key: "routines"  as const, to: "/routines"  },
  { icon: HeartPulse,      key: "sos"       as const, to: "/sos"       },
];

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

function SettingsPopover({ onClose }: { onClose: () => void }) {
  const { userName, userStatus, saveProfile } = useUserProfile();
  const { t } = useLang();

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

  function save() {
    saveProfile(draftName.trim() || userName, draftStatus);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 10px)", left: 10, right: 10,
      background: "#FAFCFA",
      borderRadius: 14,
      border: "1px solid rgba(44,53,49,0.10)",
      boxShadow: "0 8px 32px rgba(44,53,49,0.14), 0 2px 8px rgba(44,53,49,0.08)",
      padding: "18px 16px 16px",
      zIndex: 50,
      animation: "popIn 0.18s cubic-bezier(0.34,1.2,0.64,1) both",
    }}>
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

export function Sidebar() {
  const { pathname } = useLocation();
  const active = (to: string) => to === "/" ? pathname === "/" : pathname.startsWith(to);
  const { userName, userStatus } = useUserProfile();
  const { t } = useLang();
  const avatar = userName.charAt(0).toUpperCase() || "A";

  const [open, setOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <aside style={{
      width: 228, minWidth: 228, flexShrink: 0,
      background: "#F4F7F5",
      borderRight: "1px solid rgba(44,53,49,0.08)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "26px 22px 24px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Leaf size={16} color="#fff" strokeWidth={1.9} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.025em" }}>Memento</span>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        {NAV.map(({ icon: Icon, key, to }) => {
          const on = active(to);
          return (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 13px", borderRadius: 12,
              textDecoration: "none", fontSize: 14,
              fontWeight: on ? 500 : 400,
              background: on ? "#4A6B5D" : "transparent",
              color: on ? "#fff" : "#7A8A84",
              transition: "background 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { if (!on) { (e.currentTarget as HTMLAnchorElement).style.background = "#EBF0ED"; (e.currentTarget as HTMLAnchorElement).style.color = "#2C3531"; } }}
              onMouseLeave={e => { if (!on) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#7A8A84"; } }}
            >
              <Icon size={16} strokeWidth={on ? 2 : 1.7} />
              {t.nav[key]}
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "rgba(44,53,49,0.08)", margin: "0 18px 14px" }} />

      <div ref={profileRef} style={{ position: "relative", padding: "0 14px 14px" }}>
        {open && <SettingsPopover onClose={() => setOpen(false)} />}

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(74,107,93,0.22)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{avatar}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#2C3531", lineHeight: 1.25, letterSpacing: "-0.01em" }}>{userName}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A9B6F", flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: "#4A9B6F", fontWeight: 500, lineHeight: 1 }}>{(t.status as Record<string, string>)[userStatus] ?? userStatus}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(p => !p)}
            style={{
              background: open ? "rgba(74,107,93,0.14)" : "rgba(44,53,49,0.06)",
              border: "none", borderRadius: 8, width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,53,49,0.12)"; }}
            onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,53,49,0.06)"; }}
          >
            <Settings size={13} strokeWidth={1.6} color={open ? "#4A6B5D" : "#7A8A84"} style={{ transform: open ? "rotate(30deg)" : "rotate(0deg)", transition: "transform 0.25s, color 0.15s" } as React.CSSProperties} />
          </button>
        </div>
      </div>

      <div style={{ padding: "0 14px 20px" }}>
        <LanguageSelector />
      </div>
    </aside>
  );
}