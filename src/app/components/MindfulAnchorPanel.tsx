import { useState, useRef, useEffect } from "react";
import { Camera, Mic, Video, Play, Shield, CheckCircle2, X } from "lucide-react";

interface Props {
  cardId: string | null;
  onClose: () => void;
}

const HOLD_DURATION = 3000;

export function MindfulAnchorPanel({ cardId, onClose }: Props) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secured, setSecured] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setProgress(0);
    setSecured(false);
    setIsHolding(false);
  }, [cardId]);

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

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div
      style={{
        height: "100%",
        background: "#F8FAF8",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "28px 28px 20px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: 5,
            }}
          >
            Mindful Anchor
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            Front Door
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(44,53,49,0.07)",
            border: "none",
            borderRadius: 10,
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            marginTop: 2,
          }}
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px" }}>
        {/* Hold button */}
        <div className="flex flex-col items-center" style={{ paddingTop: 8, paddingBottom: 36 }}>
          <div className="relative flex items-center justify-center mb-6" style={{ width: 148, height: 148 }}>
            <svg
              width={148}
              height={148}
              style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
            >
              <circle cx={74} cy={74} r={54} fill="none" stroke="#E8EDEA" strokeWidth={7} />
              {(isHolding || secured) && (
                <circle
                  cx={74}
                  cy={74}
                  r={54}
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
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: secured
                  ? "linear-gradient(135deg, #4A9B6F, #3A7A52)"
                  : "#4A6B5D",
                border: "none",
                cursor: secured ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.15s ease, background 0.3s ease",
                transform: isHolding ? "scale(0.95)" : "scale(1)",
                boxShadow: isHolding
                  ? "0 0 0 8px rgba(74,107,93,0.12)"
                  : "0 6px 24px rgba(74,107,93,0.28)",
              }}
            >
              {secured
                ? <CheckCircle2 size={30} color="#FFFFFF" strokeWidth={1.7} />
                : <Shield size={24} color="#FFFFFF" strokeWidth={1.5} />}
            </button>
          </div>

          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: secured ? "#3A7A52" : "var(--foreground)",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: 210,
            }}
          >
            {secured
              ? "Mindfully Secured"
              : isHolding
              ? `Hold still… ${Math.round(progress)}%`
              : "Hold for 3 seconds in full mindfulness to secure"}
          </p>
        </div>

        {/* Evidence vault label */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: 14,
          }}
        >
          Evidence Vault
        </p>

        {/* Photo */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 10,
            position: "relative",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop&auto=format"
            alt="Locked front door handle"
            style={{ width: "100%", height: 116, objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "5px 12px",
              background: "rgba(44,53,49,0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Camera size={11} color="#FFFFFF" strokeWidth={1.8} />
            <span style={{ fontSize: 11, color: "#FFFFFF" }}>Today, 07:42 AM</span>
          </div>
        </div>

        {/* Voice note */}
        <div
          style={{
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#FFFFFF",
          }}
        >
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--primary)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
          </button>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>
              Voice Note · 0:04s
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
              {[4, 10, 6, 14, 8, 16, 5, 12, 9, 7, 15, 6, 11, 4, 13, 8, 5, 10, 14, 7].map((h, i) => (
                <div
                  key={`waveform-bar-${i}`}
                  style={{
                    width: 2.5,
                    height: h,
                    borderRadius: 2,
                    background: i < 8 ? "var(--primary)" : "#C8D8D0",
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 3, fontStyle: "italic" }}>
              "The door is locked, I felt the key turn"
            </p>
          </div>
          <Mic size={12} color="var(--muted-foreground)" strokeWidth={1.6} />
        </div>

        {/* Video */}
        <div
          style={{
            borderRadius: 14,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#FFFFFF",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 32,
              borderRadius: 8,
              background: "#2C3531",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Play size={11} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
              Verification Video
            </p>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>07:42 AM · 00:07s</p>
          </div>
          <Video size={12} color="var(--muted-foreground)" strokeWidth={1.6} style={{ marginLeft: "auto" }} />
        </div>
      </div>
    </div>
  );
}
