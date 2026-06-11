import { useState, useRef, useEffect } from "react";
import { Camera, Mic, Play, Shield, CheckCircle2, X, ChevronDown } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  cardLabel: string;
}

const HOLD_DURATION = 3000;

export function BottomSheet({ open, onClose, cardLabel }: Props) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secured, setSecured] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setProgress(0);
    setSecured(false);
    setIsHolding(false);
  }, [cardLabel]);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function startHold() {
    if (secured) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        setIsHolding(false);
        setSecured(true);
      }
    }, 30);
  }

  function cancelHold() {
    if (secured) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsHolding(false);
    setProgress(0);
  }

  const circumference = 2 * Math.PI * 48;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(44,53,49,0.35)",
          backdropFilter: "blur(6px)",
          zIndex: 300,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          zIndex: 301,
          background: "#F8FAF8",
          borderRadius: "24px 24px 0 0",
          maxHeight: "88vh",
          overflowY: "auto",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0,0.12,1)",
          boxShadow: "0 -8px 40px rgba(44,53,49,0.14)",
        }}
      >
        {/* Handle + header */}
        <div style={{ position: "sticky", top: 0, background: "#F8FAF8", zIndex: 1, padding: "14px 24px 12px", borderBottom: "1px solid rgba(44,53,49,0.07)" }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: "rgba(44,53,49,0.15)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 3 }}>
                Mindful Anchor
              </p>
              <h3 style={{ fontSize: 19, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>
                {cardLabel}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronDown size={14} strokeWidth={2} color="#7A8A84" />
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 24px 40px" }}>
          {/* Hold button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
            <div style={{ position: "relative", width: 132, height: 132, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width={132} height={132} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx={66} cy={66} r={48} fill="none" stroke="#E8EDEA" strokeWidth={7} />
                {(isHolding || secured) && (
                  <circle
                    cx={66} cy={66} r={48}
                    fill="none"
                    stroke={secured ? "#4A9B6F" : "#4A6B5D"}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={secured ? 0 : strokeDashoffset}
                    style={{ transition: secured ? "stroke-dashoffset 0.3s ease" : "none" }}
                  />
                )}
              </svg>
              <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                onTouchEnd={cancelHold}
                style={{
                  width: 96, height: 96, borderRadius: "50%",
                  background: secured ? "linear-gradient(135deg,#4A9B6F,#3A7A52)" : "#4A6B5D",
                  border: "none",
                  cursor: secured ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.15s ease, background 0.3s ease",
                  transform: isHolding ? "scale(0.94)" : "scale(1)",
                  boxShadow: isHolding ? "0 0 0 10px rgba(74,107,93,0.12)" : "0 8px 28px rgba(74,107,93,0.3)",
                  touchAction: "none",
                }}
              >
                {secured
                  ? <CheckCircle2 size={28} color="#fff" strokeWidth={1.7} />
                  : <Shield size={22} color="#fff" strokeWidth={1.5} />}
              </button>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: secured ? "#3A7A52" : "#2C3531", textAlign: "center", lineHeight: 1.5, maxWidth: 220 }}>
              {secured ? "Mindfully Secured ✓" : isHolding ? `Hold still… ${Math.round(progress)}%` : "Hold for 3 seconds in full mindfulness to secure"}
            </p>
          </div>

          {/* Evidence label */}
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A8A84", marginBottom: 12 }}>
            Evidence Vault
          </p>

          {/* Photo */}
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 10, position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=200&fit=crop&auto=format"
              alt="Locked front door handle"
              style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "5px 12px", background: "rgba(44,53,49,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 6 }}>
              <Camera size={11} color="#fff" strokeWidth={1.8} />
              <span style={{ fontSize: 11, color: "#fff" }}>Today, 07:42 AM</span>
            </div>
          </div>

          {/* Voice */}
          <div style={{ borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, background: "#fff" }}>
            <button style={{ width: 32, height: 32, borderRadius: "50%", background: "#4A6B5D", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Play size={12} color="#fff" fill="#fff" />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#2C3531", marginBottom: 4 }}>Voice Note · 0:04s</p>
              <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
                {[4, 10, 6, 14, 8, 16, 5, 12, 9, 7, 15, 6, 11, 4, 13, 8, 5, 10, 14, 7].map((h, i) => (
                  <div key={`mob-waveform-${i}`} style={{ width: 2.5, height: h, borderRadius: 2, background: i < 8 ? "#4A6B5D" : "#C8D8D0" }} />
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#7A8A84", marginTop: 3, fontStyle: "italic" }}>"The door is locked, I felt the key turn"</p>
            </div>
            <Mic size={12} color="#7A8A84" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </>
  );
}
