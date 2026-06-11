import { LucideIcon, CheckCircle2, Clock } from "lucide-react";
import { useLang } from "../contexts/LangContext";

type Status = "Pending" | "Secure";

interface CheckCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  status: Status;
  isActive: boolean;
  onSelect: () => void;
  compact?: boolean;
}

export function CheckCard({
  id,
  icon: Icon,
  label,
  status,
  isActive,
  onSelect,
  compact = false,
}: CheckCardProps) {
  const { t } = useLang();
  const isPending = status === "Pending";
  const statusText = isPending ? t.dashboard.pending : t.dashboard.secure;

  return (
    <button
      onClick={onSelect}
      style={{
        flex: compact ? "1 1 calc(50% - 6px)" : "1 1 190px",
        minWidth: compact ? "calc(50% - 6px)" : 180,
        maxWidth: compact ? "calc(50% - 6px)" : undefined,
        textAlign: "left",
        background: isActive ? "#F0F6F3" : "#fff",
        border: isActive ? "1.5px solid #4A6B5D" : "1px solid rgba(44,53,49,0.1)",
        borderRadius: compact ? 18 : 20,
        padding: compact ? "16px 18px" : "20px 20px",
        cursor: "pointer",
        outline: "none",
        transition: "all 0.15s",
        boxShadow: isActive
          ? "0 4px 16px rgba(74,107,93,0.10)"
          : "0 1px 3px rgba(44,53,49,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: compact ? 40 : 38,
            height: compact ? 40 : 38,
            borderRadius: compact ? 12 : 11,
            background: isPending ? "#FDF3EB" : "#EAF2EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={compact ? 18 : 17}
            strokeWidth={1.6}
            color={isPending ? "#C47A3A" : "#4A6B5D"}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            background: isPending ? "#FEF3E2" : "#EAF5EE",
            color: isPending ? "#B06B20" : "#3A7A52",
            borderRadius: 20,
            padding: compact ? "3px 9px" : "3px 8px",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {isPending ? (
            <Clock size={10} strokeWidth={2} />
          ) : (
            <CheckCircle2 size={10} strokeWidth={2} />
          )}
          {isPending ? t.dashboard.pending : t.dashboard.secure}
        </div>
      </div>

      <p
        style={{
          fontSize: compact ? 14 : 14,
          fontWeight: 500,
          color: "#2C3531",
          marginBottom: compact ? 2 : 3,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "#7A8A84",
        }}
      >
        {statusText}
      </p>
    </button>
  );
}
