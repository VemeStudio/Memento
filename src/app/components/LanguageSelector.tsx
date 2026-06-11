import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLang } from "../contexts/LangContext";
import type { Lang } from "../i18n/translations";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español",  flag: "🇪🇸" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "zh", label: "中文",      flag: "🇨🇳" },
];

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <style>{`
        @keyframes langSlideUp   { from { opacity:0; transform:scale(0.96) translateY(5px);  } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes langSlideDown { from { opacity:0; transform:scale(0.96) translateY(-5px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      {compact ? (
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            width: 32, height: 32, borderRadius: 10, border: "none",
            background: open ? "rgba(74,107,93,0.12)" : "rgba(44,53,49,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,53,49,0.10)"; }}
          onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,53,49,0.06)"; }}
        >
          <Globe size={15} strokeWidth={1.6} color={open ? "#4A6B5D" : "#7A8A84"} />
        </button>
      ) : (
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            width: "100%", padding: "9px 11px", borderRadius: 10,
            background: open ? "rgba(74,107,93,0.08)" : "transparent",
            border: "1px solid " + (open ? "rgba(74,107,93,0.20)" : "rgba(44,53,49,0.10)"),
            cursor: "pointer", outline: "none",
            boxSizing: "border-box", fontFamily: "var(--font-family)",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { if (!open) { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(44,53,49,0.05)"; b.style.borderColor = "rgba(44,53,49,0.14)"; } }}
          onMouseLeave={e => { if (!open) { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.borderColor = "rgba(44,53,49,0.10)"; } }}
        >
          <Globe size={13} strokeWidth={1.6} color="#7A8A84" style={{ flexShrink: 0 } as React.CSSProperties} />
          <span style={{ flex: 1, textAlign: "left", fontSize: 12, color: "#4A5550", letterSpacing: "-0.01em" }}>{t.sidebar.language}</span>
          <ChevronDown
            size={11} strokeWidth={2} color="#9AA8A2"
            style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" } as React.CSSProperties}
          />
        </button>
      )}

      {open && (
        <div style={{
          position: "absolute",
          ...(compact
            ? { top: "calc(100% + 6px)", right: 0 }
            : { bottom: "calc(100% + 6px)", left: 0, right: 0 }),
          background: "#FAFCFA",
          borderRadius: 12,
          border: "1px solid rgba(44,53,49,0.10)",
          boxShadow: "0 12px 36px rgba(44,53,49,0.15), 0 2px 8px rgba(44,53,49,0.07)",
          overflow: "hidden",
          zIndex: 200,
          minWidth: compact ? 190 : undefined,
          animation: compact ? "langSlideDown 0.17s cubic-bezier(0.34,1.1,0.64,1) both" : "langSlideUp 0.17s cubic-bezier(0.34,1.1,0.64,1) both",
          fontFamily: "var(--font-family)",
        }}>
          {LANGS.map(l => {
            const sel = lang === l.code;
            return (
              <button key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 13px", border: "none", background: "transparent",
                  cursor: "pointer", textAlign: "left", outline: "none",
                  fontFamily: "var(--font-family)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#EFF4F1"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              >
                <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{l.flag}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: sel ? 500 : 400, color: sel ? "#2C3531" : "#5A6B65", letterSpacing: "-0.01em" }}>{l.label}</span>
                {sel && <Check size={12} strokeWidth={2.5} color="#4A6B5D" style={{ flexShrink: 0 } as React.CSSProperties} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
