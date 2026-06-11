import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { useWindowWidth } from "./useWindowWidth";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router";

interface Props {
  children: ReactNode;
  headerLeft: ReactNode;
  headerRight?: ReactNode;
  activePage: string;
}

export function PageLayout({ children, headerLeft, headerRight, activePage }: Props) {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-family)", display: "flex", overflow: "hidden" }}>
      {!isMobile && <Sidebar activePage={activePage} />}
      {isMobile && <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        <header style={{
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
          padding: isMobile ? "0 20px" : "0 40px",
          height: isMobile ? 60 : 72,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--foreground)", display: "flex" }}>
                <Menu size={20} strokeWidth={1.7} />
              </button>
            )}
            {headerLeft}
          </div>
          {headerRight && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{headerRight}</div>}
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
