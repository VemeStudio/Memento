import { Link } from "react-router";
import { useUserProfile } from "../contexts/UserProfileContext";
import { X, Leaf, LayoutDashboard, HeartPulse, UserCircle } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  to: "/" },
  { icon: HeartPulse,      label: "SOS Calme",  to: "/sos" },
  { icon: UserCircle,      label: "My Space",   to: "/log" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: Props) {
  const { userName } = useUserProfile();
  const avatar = userName ? userName.charAt(0).toUpperCase() : "A";

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(44,53,49,0.3)", backdropFilter: "blur(4px)", zIndex: 200, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.25s ease" }}
      />
      <div
        style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 272, background: "#F4F7F5", zIndex: 201, display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.32,0,0.12,1)", boxShadow: "4px 0 32px rgba(44,53,49,0.12)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={17} color="#fff" strokeWidth={1.8} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.02em" }}>Memento</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={13} strokeWidth={2} color="#7A8A84" />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, textDecoration: "none", background: "transparent", color: "#7A8A84", fontSize: 14 }}
            >
              <Icon size={16} strokeWidth={1.7} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "16px 20px 32px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(44,53,49,0.08)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{avatar}</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#2C3531" }}>{userName || "Alex"}</p>
            <p style={{ fontSize: 11, color: "#7A8A84" }}>Free plan</p>
          </div>
        </div>
      </div>
    </>
  );
}
