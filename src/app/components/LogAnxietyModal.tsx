import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LogAnxietyModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  function handleSave() {
    if (selected === null) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelected(null);
      onClose();
    }, 1200);
  }

  const labels: Record<number, string> = {
    1: "Very calm",
    2: "Calm",
    3: "Relaxed",
    4: "Mild tension",
    5: "Moderate",
    6: "Noticeable",
    7: "High",
    8: "Very high",
    9: "Intense",
    10: "Overwhelming",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,53,49,0.35)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: 24,
          padding: "32px 36px",
          width: 420,
          maxWidth: "90vw",
          boxShadow: "0 24px 60px rgba(44,53,49,0.18)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: 4,
              }}
            >
              How are you feeling?
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Rate your current anxiety level honestly.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--muted)",
              border: "none",
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted-foreground)",
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              style={{
                padding: "12px 4px",
                borderRadius: 12,
                border: selected === n ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                background:
                  selected === n
                    ? n <= 4
                      ? "#EAF5EE"
                      : n <= 7
                      ? "#FEF3E2"
                      : "#FDECEA"
                    : "var(--card)",
                color:
                  selected === n
                    ? n <= 4
                      ? "#3A7A52"
                      : n <= 7
                      ? "#B06B20"
                      : "#C0614A"
                    : "var(--foreground)",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {n}
            </button>
          ))}
        </div>

        {selected !== null && (
          <p
            style={{
              fontSize: 13,
              color: "var(--muted-foreground)",
              textAlign: "center",
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            {selected}/10 — {labels[selected]}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={selected === null}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            border: "none",
            background:
              saved
                ? "#4A9B6F"
                : selected === null
                ? "var(--muted)"
                : "var(--primary)",
            color: selected === null ? "var(--muted-foreground)" : "#FFFFFF",
            fontSize: 14,
            fontWeight: 500,
            cursor: selected === null ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {saved ? "Logged ✓" : "Save to My Log"}
        </button>
      </div>
    </div>
  );
}
