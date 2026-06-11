import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { LayoutDashboard, HeartPulse, Trophy, BookMarked, Settings, Leaf } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { SettingsPopover } from "./SettingsPopover"; // C'est lui qui est utilisé maintenant !
import { useUserProfile } from "../contexts/UserProfileContext";
import { useLang } from "../contexts/LangContext";

const NAV = [
  { icon: LayoutDashboard, key: "dashboard" as const, to: "/"          },
  { icon: Trophy,          key: "victories" as const, to: "/victories" },
  { icon: BookMarked,      key: "routines"  as const, to: "/routines"  },
  { icon: HeartPulse,      key: "sos"       as const, to: "/sos"       },
];

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