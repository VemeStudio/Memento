import { DoorOpen, Flame, AppWindow, Lightbulb, Car, Plus, CheckCircle2, Clock } from "lucide-react";

export const categories = [
  { id: "front-door",     icon: DoorOpen,   label: "Front Door",          status: "Secured 22 mins ago",   statusType: "secure"  as const, lastChecked: "07:42 AM" },
  { id: "kitchen-gas",    icon: Flame,       label: "Kitchen Gas Stoves",  status: "Checked & Off",         statusType: "secure"  as const, lastChecked: "07:38 AM" },
  { id: "living-windows", icon: AppWindow,   label: "Living Room Windows", status: "Pending Verification",  statusType: "pending" as const, lastChecked: "Yesterday" },
  { id: "bedroom-lights", icon: Lightbulb,   label: "Bedroom Lights",      status: "Secured",               statusType: "secure"  as const, lastChecked: "07:55 AM" },
  { id: "car-garage",     icon: Car,         label: "Car Garage",          status: "Secured",               statusType: "secure"  as const, lastChecked: "07:20 AM" },
];

interface Props {
  activeCard: string | null;
  onSelectCard: (id: string) => void;
  /** compact=true: 2-col tight grid for mobile */
  compact?: boolean;
}

export function QuickCheckGrid({ activeCard, onSelectCard, compact = false }: Props) {
  return (
    <div>
      <h2
        style={{
          fontSize: compact ? 18 : 22,
          fontWeight: 500,
          color: "var(--foreground)",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        Quick-Check Overview
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: compact ? 20 : 28 }}>
        Tap any card to open its Mindful Anchor.
      </p>

      {/* Fluid flex-wrap grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: compact ? 12 : 16,
        }}
      >
        {categories.map(({ id, icon: Icon, label, status, statusType, lastChecked }) => {
          const isActive = activeCard === id;
          const isSecure = statusType === "secure";
          /* Each card: min 200px, grows to fill row */
          return (
            <button
              key={id}
              onClick={() => onSelectCard(id)}
              style={{
                flex: compact ? "1 1 calc(50% - 6px)" : "1 1 220px",
                minWidth: compact ? "calc(50% - 6px)" : 200,
                maxWidth: compact ? "calc(50% - 6px)" : undefined,
                textAlign: "left",
                background: isActive ? "#F2F7F4" : "var(--card)",
                border: isActive ? "1.5px solid #4A6B5D" : "1px solid var(--border)",
                borderRadius: compact ? 18 : 22,
                padding: compact ? "18px 18px" : "24px 24px",
                cursor: "pointer",
                outline: "none",
                transition: "box-shadow 0.18s ease, background 0.18s ease",
                boxShadow: isActive
                  ? "0 4px 20px rgba(74,107,93,0.10)"
                  : "0 1px 4px rgba(44,53,49,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: compact ? 14 : 18 }}>
                <div
                  style={{
                    width: compact ? 36 : 42, height: compact ? 36 : 42,
                    borderRadius: compact ? 11 : 13,
                    background: isSecure ? "#EAF2EE" : "#FDF3EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon size={compact ? 16 : 19} strokeWidth={1.6} color={isSecure ? "#4A6B5D" : "#C47A3A"} />
                </div>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: isSecure ? "#EAF5EE" : "#FEF3E2",
                    color: isSecure ? "#3A7A52" : "#B06B20",
                    borderRadius: 20, padding: "3px 9px",
                    fontSize: 11, fontWeight: 500,
                  }}
                >
                  {isSecure ? <CheckCircle2 size={10} strokeWidth={2} /> : <Clock size={10} strokeWidth={2} />}
                  {isSecure ? "Secure" : "Pending"}
                </div>
              </div>

              <p style={{ fontSize: compact ? 13 : 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                {label}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                {status}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 3, opacity: 0.6 }}>
                Last checked {lastChecked}
              </p>
            </button>
          );
        })}

        {/* Add custom */}
        <button
          style={{
            flex: compact ? "1 1 calc(50% - 6px)" : "1 1 220px",
            minWidth: compact ? "calc(50% - 6px)" : 200,
            maxWidth: compact ? "calc(50% - 6px)" : undefined,
            background: "transparent",
            border: "1.5px dashed var(--border)",
            borderRadius: compact ? 18 : 22,
            padding: compact ? "18px" : "24px",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minHeight: compact ? 110 : 140,
            transition: "border-color 0.18s ease, background 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#B5C5BE";
            (e.currentTarget as HTMLButtonElement).style.background = "#F7FAF8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 11, border: "1.5px dashed #B5C5BE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={15} color="var(--muted-foreground)" strokeWidth={1.8} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: compact ? 12 : 13, fontWeight: 500, color: "var(--muted-foreground)" }}>Add Custom Trigger</p>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6, marginTop: 2 }}>Personalize check-ins</p>
          </div>
        </button>
      </div>
    </div>
  );
}
