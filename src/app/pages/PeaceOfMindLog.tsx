import { useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { DoorOpen, Flame, AppWindow, Lightbulb, Car, Image, Mic, Video, X, Play, CheckCircle2, ChevronRight } from "lucide-react";

const FILTERS = ["All", "Front Door", "Gas Stoves", "Windows", "Bedroom Lights", "Car Garage"];

const iconMap: Record<string, React.ElementType> = {
  "Front Door":      DoorOpen,
  "Gas Stoves":      Flame,
  "Windows":         AppWindow,
  "Bedroom Lights":  Lightbulb,
  "Car Garage":      Car,
};

interface LogEntry {
  id: string;
  category: string;
  time: string;
  label: string;
  evidence: ("photo" | "audio" | "video")[];
  photoUrl?: string;
  audioNote?: string;
}

const LOG_ENTRIES: LogEntry[] = [
  { id: "l1", category: "Front Door",     time: "Today at 07:42 AM",      label: "Secured in full mindfulness", evidence: ["photo", "audio"],        photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop&auto=format", audioNote: "The door is locked, I felt the key turn." },
  { id: "l2", category: "Gas Stoves",     time: "Today at 07:38 AM",      label: "Secured in full mindfulness", evidence: ["photo"],                  photoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=340&fit=crop&auto=format" },
  { id: "l3", category: "Bedroom Lights", time: "Today at 07:55 AM",      label: "Secured in full mindfulness", evidence: ["photo", "audio", "video"], photoUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=340&fit=crop&auto=format", audioNote: "All lights confirmed off, blinds down." },
  { id: "l4", category: "Car Garage",     time: "Today at 07:20 AM",      label: "Secured in full mindfulness", evidence: ["photo"],                  photoUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=340&fit=crop&auto=format" },
  { id: "l5", category: "Front Door",     time: "Yesterday at 08:15 AM",  label: "Secured in full mindfulness", evidence: ["photo", "audio"],          photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop&auto=format", audioNote: "Door is locked and deadbolt secured." },
  { id: "l6", category: "Gas Stoves",     time: "Yesterday at 08:10 AM",  label: "Secured in full mindfulness", evidence: ["photo"],                  photoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=340&fit=crop&auto=format" },
  { id: "l7", category: "Windows",        time: "Yesterday at 08:22 AM",  label: "Secured in full mindfulness", evidence: ["photo", "audio"],          photoUrl: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=340&fit=crop&auto=format", audioNote: "All living room windows latched and locked." },
  { id: "l8", category: "Front Door",     time: "June 3 at 07:50 AM",     label: "Secured in full mindfulness", evidence: ["audio"],                                                                                                                              audioNote: "Checked twice, deadbolt fully turned." },
];

const evidenceIcons: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  photo: { icon: Image, label: "Photo",      color: "#4A6B5D", bg: "#EAF5EE" },
  audio: { icon: Mic,   label: "Audio Note", color: "#7A5C8A", bg: "#F3EEF8" },
  video: { icon: Video, label: "Video",      color: "#B06B20", bg: "#FEF3E2" },
};

export function PeaceOfMindLog() {
  const [filter, setFilter] = useState("All");
  const [openEntry, setOpenEntry] = useState<LogEntry | null>(null);

  const filtered = filter === "All" ? LOG_ENTRIES : LOG_ENTRIES.filter(e => e.category === filter || (filter === "Gas Stoves" && e.category === "Gas Stoves"));

  // Group by date label
  const groups: Record<string, LogEntry[]> = {};
  for (const e of filtered) {
    const day = e.time.split(" at ")[0];
    if (!groups[day]) groups[day] = [];
    groups[day].push(e);
  }

  return (
    <PageLayout
      activePage="Peace-of-Mind Log"
      headerLeft={
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            Peace-of-Mind Log
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
            A clear history of your mindful moments. Your memory is real.
          </p>
        </div>
      }
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 40px" }}>

        {/* Filter bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  background: active ? "#4A6B5D" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "var(--muted-foreground)",
                  border: active ? "none" : "1px solid var(--border)",
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 2px 10px rgba(74,107,93,0.2)" : "none",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        {Object.entries(groups).map(([day, entries]) => (
          <div key={day} style={{ marginBottom: 36 }}>
            {/* Date heading */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{day}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{entries.length} check{entries.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Entries */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {entries.map((entry) => {
                const Icon = iconMap[entry.category] ?? DoorOpen;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setOpenEntry(entry)}
                    style={{
                      background: "#FFFFFF", border: "1px solid var(--border)",
                      borderRadius: 18, padding: "18px 20px",
                      display: "flex", alignItems: "center", gap: 16,
                      cursor: "pointer", textAlign: "left", outline: "none",
                      transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(44,53,49,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#B5C5BE"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
                  >
                    {/* Icon bubble */}
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={19} strokeWidth={1.6} color="#4A6B5D" />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>{entry.category}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={13} color="#4A9B6F" strokeWidth={2} />
                          <span style={{ fontSize: 12, color: "#4A9B6F", fontWeight: 500 }}>{entry.label}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>{entry.time}</p>
                      {/* Evidence chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {entry.evidence.map((ev) => {
                          const { icon: EIcon, label, color, bg } = evidenceIcons[ev];
                          return (
                            <span key={ev} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color, background: bg, padding: "3px 9px", borderRadius: 20 }}>
                              <EIcon size={10} strokeWidth={2} />{label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <ChevronRight size={15} color="var(--muted-foreground)" strokeWidth={1.7} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Evidence popup */}
      {openEntry && (
        <div
          onClick={() => setOpenEntry(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(44,53,49,0.4)", backdropFilter: "blur(8px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#FFFFFF", borderRadius: 24, width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(44,53,49,0.2)", overflow: "hidden" }}
          >
            {/* Popup header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 3 }}>Evidence Vault</p>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{openEntry.category}</h3>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>{openEntry.time}</p>
              </div>
              <button onClick={() => setOpenEntry(null)} style={{ background: "rgba(44,53,49,0.07)", border: "none", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={13} strokeWidth={2} color="#7A8A84" />
              </button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Photo */}
              {openEntry.photoUrl && (
                <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
                  <img src={openEntry.photoUrl} alt={`Evidence for ${openEntry.category}`} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                </div>
              )}

              {/* Audio */}
              {openEntry.audioNote && (
                <div style={{ background: "#F8FAF8", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <button style={{ width: 34, height: 34, borderRadius: "50%", background: "#4A6B5D", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    <Play size={12} color="#fff" fill="#fff" />
                  </button>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>Voice Note</p>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>"{openEntry.audioNote}"</p>
                  </div>
                </div>
              )}

              {/* Reassurance */}
              <div style={{ background: "#EEF5F1", borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#3A4B44" }}>
                  This memory is real. You completed this check mindfully and this evidence confirms it. You can trust yourself.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
