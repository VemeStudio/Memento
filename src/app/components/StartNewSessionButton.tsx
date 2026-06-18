import { RotateCcw } from "lucide-react";
import { useUnifiedCards } from "../contexts/UnifiedCardsContext";

/**
 * StartNewSessionButton Component
 *
 * A minimalist button that resets all card progress statuses while keeping
 * card definitions intact. Designed for settings menus with a clean, organic aesthetic.
 *
 * Features:
 * - Resets all card statuses to "Pending" (without deleting cards)
 * - Keeps all custom user-created cards intact
 * - Saves updated data to localStorage
 * - Triggers a full page refresh
 */

interface StartNewSessionButtonProps {
  /** Optional custom className for additional styling */
  className?: string;
  /** Optional custom label text (default: "Start a new session") */
  label?: string;
  /** Compact mode for tighter layouts */
  compact?: boolean;
}

export function StartNewSessionButton({
  className = "",
  label = "Start a new session",
  compact = false,
}: StartNewSessionButtonProps) {
  const { startNewSession } = useUnifiedCards();

  return (
    <button
      onClick={startNewSession}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 8 : 10,
        padding: compact ? "10px 16px" : "12px 20px",
        background: "transparent",
        border: "1.5px solid rgba(44,53,49,0.15)",
        borderRadius: compact ? 10 : 12,
        cursor: "pointer",
        outline: "none",
        transition: "all 0.2s ease",
        fontSize: compact ? 13 : 14,
        fontWeight: 500,
        color: "#7A8A84",
        fontFamily: "var(--font-family)",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = "#F5F8F6";
        btn.style.borderColor = "rgba(74,107,93,0.30)";
        btn.style.color = "#4A6B5D";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = "transparent";
        btn.style.borderColor = "rgba(44,53,49,0.15)";
        btn.style.color = "#7A8A84";
      }}
    >
      <RotateCcw
        size={compact ? 15 : 16}
        strokeWidth={1.8}
        style={{
          transition: "transform 0.2s ease",
        }}
      />
      <span style={{ letterSpacing: "-0.01em" }}>{label}</span>
    </button>
  );
}

/**
 * USAGE EXAMPLES:
 *
 * Basic usage:
 * <StartNewSessionButton />
 *
 * Compact mode:
 * <StartNewSessionButton compact />
 *
 * Custom label:
 * <StartNewSessionButton label="Reset All Data" />
 *
 * With custom className:
 * <StartNewSessionButton className="my-custom-class" />
 *
 * CUSTOMIZATION NOTES:
 *
 * 1. To clear additional localStorage keys:
 *    - Edit the handleStartNewSession function
 *    - Add more localStorage.removeItem("key_name") calls
 *
 * 2. To clear ALL localStorage (nuclear option):
 *    - Replace individual removeItem calls with: localStorage.clear()
 *
 * 3. To add confirmation dialog:
 *    - Uncomment the window.confirm() lines in handleStartNewSession
 *
 * 4. To customize colors:
 *    - Modify the inline styles in the button element
 *    - Update hover state colors in onMouseEnter/onMouseLeave
 */
