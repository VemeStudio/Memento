import { useState } from "react";
import {
  DoorOpen, Flame, AppWindow, Lightbulb,
  Plug, Droplets, Car, Zap, X,
} from "lucide-react";
import { useLang } from "../contexts/LangContext";

/**
 * MODAL_ICONS
 * Available icon options for custom check cards
 */
const MODAL_ICONS = [
  { id: "door",      icon: DoorOpen   },
  { id: "flame",     icon: Flame      },
  { id: "window",    icon: AppWindow  },
  { id: "light",     icon: Lightbulb  },
  { id: "outlet",    icon: Plug       },
  { id: "water",     icon: Droplets   },
  { id: "garage",    icon: Car        },
  { id: "appliance", icon: Zap        },
];

interface AddCheckModalProps {
  onClose: () => void;
  onSubmit: (data: { label: string; description: string; iconId: string }) => void;
}

/**
 * AddCheckModal Component
 *
 * Overlay modal for creating custom check cards.
 * Captures user input (title, description, icon) and submits to parent.
 *
 * FORM SUBMISSION FLOW:
 * 1. User fills in trigger name (required)
 * 2. User optionally adds description
 * 3. User selects an icon (default: "door")
 * 4. On submit, validates and passes data to parent via onSubmit callback
 * 5. Parent handles creating the card object and updating localStorage
 * 6. Modal closes and form clears automatically
 */
export function AddCheckModal({ onClose, onSubmit }: AddCheckModalProps) {
  const { t } = useLang();
  const tm = t.modal;
  // ══════════════════════════════════════════════════════════════
  // FORM STATE - useState for all input fields
  // ══════════════════════════════════════════════════════════════
  const [triggerName, setTriggerName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("door");
  const [errors, setErrors] = useState<{ triggerName?: string }>({});

  /**
   * handleSubmit - FORM SUBMISSION HANDLER
   *
   * This function is called when the user clicks "Create Trigger"
   *
   * EXECUTION STEPS:
   * 1. Validates that trigger name is not empty
   * 2. If valid, passes form data to parent via onSubmit callback
   * 3. Parent creates card object with unique ID and default status
   * 4. Parent updates main card list state
   * 5. Parent persists to localStorage
   * 6. Clears form and closes modal
   */
  const handleSubmit = () => {
    // Step 1: Validation
    if (!triggerName.trim()) {
      setErrors({ triggerName: tm.triggerError });
      return;
    }

    // Step 2: Transfer data to parent component
    // Parent will handle:
    // - Creating card object with unique ID
    // - Adding to card list state
    // - Persisting to localStorage
    onSubmit({
      label: triggerName.trim(),
      description: description.trim(),
      iconId: selectedIcon,
    });

    // Step 3: Clear form inputs for next use
    setTriggerName("");
    setDescription("");
    setSelectedIcon("door");
    setErrors({});

    // Step 4: Close modal automatically
    onClose();
  };

  /**
   * handleCancel - Cancel button handler
   * Clears form and closes without saving
   */
  const handleCancel = () => {
    setTriggerName("");
    setDescription("");
    setSelectedIcon("door");
    setErrors({});
    onClose();
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER - JSX/TSX Structure
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      {/* Overlay backdrop */}
      <style>{`@keyframes popIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.90); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }`}</style>
      <div
        onClick={handleCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(30,42,38,0.48)",
          zIndex: 300,
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "#FAFCFA",
          borderRadius: 20,
          padding: "28px 28px 24px",
          width: "min(440px, 92vw)",
          zIndex: 301,
          boxShadow: "0 20px 60px rgba(30,42,38,0.22), 0 4px 16px rgba(30,42,38,0.10)",
          animation: "popIn 0.22s cubic-bezier(0.34,1.1,0.64,1) both",
          fontFamily: "var(--font-family)",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#2C3531", letterSpacing: "-0.025em" }}>
            {tm.title}
          </h2>
          <button
            onClick={handleCancel}
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: "rgba(44,53,49,0.08)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={13} strokeWidth={2} color="#7A8A84" />
          </button>
        </div>

        {/* Trigger Name Input */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#7A8A84",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {tm.triggerName} *
          </label>
          <input
            type="text"
            value={triggerName}
            onChange={(e) => {
              setTriggerName(e.target.value);
              setErrors({});
            }}
            placeholder={tm.triggerHint}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              border: errors.triggerName
                ? "1.5px solid #E07A5F"
                : "1.5px solid rgba(44,53,49,0.14)",
              borderRadius: 12,
              background: "#fff",
              fontSize: 14,
              color: "#2C3531",
              fontFamily: "var(--font-family)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              if (!errors.triggerName) {
                e.target.style.borderColor = "#4A6B5D";
              }
            }}
            onBlur={(e) => {
              if (!errors.triggerName) {
                e.target.style.borderColor = "rgba(44,53,49,0.14)";
              }
            }}
          />
          {errors.triggerName && (
            <p style={{ fontSize: 11, color: "#E07A5F", marginTop: 6, fontStyle: "italic" }}>
              {errors.triggerName}
            </p>
          )}
        </div>

        {/* Description Input (Optional) */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#7A8A84",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {tm.descLabel}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={tm.descHint}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              border: "1.5px solid rgba(44,53,49,0.14)",
              borderRadius: 12,
              background: "#fff",
              fontSize: 14,
              color: "#2C3531",
              fontFamily: "var(--font-family)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4A6B5D")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(44,53,49,0.14)")}
          />
        </div>

        {/* Icon Selector */}
        <div style={{ marginBottom: 26 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#7A8A84",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {tm.iconLabel}
          </label>

          {/* 4 × 2 icon grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
            {MODAL_ICONS.map(({ id, icon: Icon }) => {
              const selected = selectedIcon === id;
              const label = tm.icons[id as keyof typeof tm.icons];
              return (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  type="button"
                  style={{
                    height: 60,
                    minWidth: 0,
                    borderRadius: 12,
                    border: selected ? "2px solid #4A6B5D" : "1.5px solid rgba(44,53,49,0.12)",
                    background: selected ? "#EAF2EE" : "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: "0 4px",
                    boxShadow: selected ? "0 0 0 3px rgba(74,107,93,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#F5FAF7";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,107,93,0.28)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,53,49,0.12)";
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.6} color={selected ? "#4A6B5D" : "#A8BCAF"} />
                  <span
                    style={{
                      fontSize: 10,
                      color: selected ? "#4A6B5D" : "#A8BCAF",
                      fontWeight: selected ? 600 : 400,
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: "#4A6B5D",
            border: "none",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "#3A5A4D"}
          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "#4A6B5D"}
        >
          {tm.submit}
        </button>
      </div>
    </>
  );
}

/**
 * ════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ════════════════════════════════════════════════════════════════
 *
 * In parent component (e.g., Dashboard.tsx):
 *
 * const [modalOpen, setModalOpen] = useState(false);
 * const { addCustomCard } = useCustomCards();
 *
 * const handleAddCard = (data: { label: string; description: string; iconId: string }) => {
 *   // This function receives the form data from the modal
 *   // and creates a new card with unique ID and persistence
 *
 *   addCustomCard({
 *     label: data.label,
 *     description: data.description,
 *     iconId: data.iconId,
 *   });
 *
 *   // The card is now:
 *   // 1. Added to the customCards array
 *   // 2. Saved to localStorage automatically
 *   // 3. Available in the card grid
 * };
 *
 * return (
 *   <>
 *     <button onClick={() => setModalOpen(true)}>Add Custom Check</button>
 *     {modalOpen && (
 *       <AddCheckModal
 *         onClose={() => setModalOpen(false)}
 *         onSubmit={handleAddCard}
 *       />
 *     )}
 *   </>
 * );
 */
