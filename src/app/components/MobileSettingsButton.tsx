import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { SettingsPopover } from "./SettingsPopover";

export function MobileSettingsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          background: open ? "rgba(74,107,93,0.14)" : "rgba(44,53,49,0.06)",
          border: "none", borderRadius: 8, width: 30, height: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
        }}
      >
        <Settings
          size={14} strokeWidth={1.6}
          color={open ? "#4A6B5D" : "#7A8A84"}
          style={{ transform: open ? "rotate(30deg)" : "rotate(0deg)", transition: "transform 0.25s, color 0.15s" } as React.CSSProperties}
        />
      </button>
      {open && <SettingsPopover onClose={() => setOpen(false)} direction="down" />}
    </div>
  );
}
