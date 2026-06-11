import { Link, useLocation } from "react-router";
import { LayoutDashboard, HeartPulse, Trophy, BookMarked } from "lucide-react";
import { useLang } from "../contexts/LangContext";

const NAV = [
  { icon: LayoutDashboard, key: "dashboard" as const, to: "/"          },
  { icon: Trophy,          key: "victories" as const, to: "/victories" },
  { icon: BookMarked,      key: "routines"  as const, to: "/routines"  },
  { icon: HeartPulse,      key: "sos"       as const, to: "/sos"       },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const active = (to: string) => to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(244,247,245,0.96)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid rgba(44,53,49,0.1)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 6px)",
      zIndex: 100,
    }}>
      {NAV.map(({ icon: Icon, key, to }) => {
        const on = active(to);
        return (
          <Link key={to} to={to} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, padding: "9px 0 7px",
            textDecoration: "none",
            color: on ? "#4A6B5D" : "#9AA8A2",
            transition: "color 0.15s",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: on ? "rgba(74,107,93,0.12)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}>
              <Icon size={18} strokeWidth={on ? 2.1 : 1.6} />
            </div>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, letterSpacing: "0.01em" }}>{t.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
