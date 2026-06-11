import { useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { DoorOpen, Flame, AppWindow, Lightbulb, Car, Plus, Shield, Image, Mic, Video, Check, Pencil, Trash2, ChevronRight } from "lucide-react";

const ALL_TRIGGERS = [
  { id: "front-door",     icon: DoorOpen,  label: "Front Door" },
  { id: "kitchen-gas",    icon: Flame,     label: "Kitchen Gas Stoves" },
  { id: "living-windows", icon: AppWindow, label: "Living Room Windows" },
  { id: "bedroom-lights", icon: Lightbulb, label: "Bedroom Lights" },
  { id: "car-garage",     icon: Car,       label: "Car Garage" },
];

interface Ritual {
  id: string;
  name: string;
  triggers: string[];
  evidence: string[];
  color: string;
  lastUsed: string;
}

const INITIAL_RITUALS: Ritual[] = [
  {
    id: "r1",
    name: "Leaving for Work",
    triggers: ["front-door", "kitchen-gas", "living-windows"],
    evidence: ["photo", "audio"],
    color: "#4A6B5D",
    lastUsed: "Today, 07:55 AM",
  },
  {
    id: "r2",
    name: "Bedtime Routine",
    triggers: ["bedroom-lights", "front-door", "living-windows"],
    evidence: ["photo"],
    color: "#7A5C8A",
    lastUsed: "Yesterday, 10:30 PM",
  },
];

const EVIDENCE_OPTIONS = [
  { id: "photo", icon: Image, label: "Photo" },
  { id: "audio", icon: Mic,   label: "Audio Voice Note" },
  { id: "video", icon: Video, label: "Video" },
];

export function CustomRituals() {
  const [rituals, setRituals] = useState<Ritual[]>(INITIAL_RITUALS);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(["front-door", "kitchen-gas"]);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(["photo"]);
  const [ritualName, setRitualName] = useState("Morning Check");
  const [saved, setSaved] = useState(false);

  function toggleTrigger(id: string) {
    setSelectedTriggers((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleEvidence(id: string) {
    setSelectedEvidence((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSave() {
    if (!ritualName.trim() || selectedTriggers.length === 0) return;
    const newRitual: Ritual = {
      id: `r${Date.now()}`,
      name: ritualName,
      triggers: selectedTriggers,
      evidence: selectedEvidence,
      color: "#4A6B5D",
      lastUsed: "Never used",
    };
    setRituals((prev) => [newRitual, ...prev]);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setRitualName("New Ritual");
      setSelectedTriggers([]);
      setSelectedEvidence(["photo"]);
    }, 1500);
  }

  function deleteRitual(id: string) {
    setRituals((prev) => prev.filter(r => r.id !== id));
  }

  const triggerLabels = selectedTriggers
    .map(id => ALL_TRIGGERS.find(t => t.id === id)?.label)
    .filter(Boolean);

  return (
    <PageLayout
      activePage="Custom Rituals"
      headerLeft={
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            Custom Rituals
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
            Create structured routines to replace endless checking loops.
          </p>
        </div>
      }
    >
      <div
        style={{
          padding: "36px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 28,
          alignItems: "start",
          maxWidth: 1200,
        }}
      >
        {/* ── Left: existing rituals ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
              Your Routines
            </h2>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)", background: "var(--muted)", padding: "3px 10px", borderRadius: 20 }}>
              {rituals.length} ritual{rituals.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rituals.map((ritual) => {
              const triggerObjs = ritual.triggers.map(id => ALL_TRIGGERS.find(t => t.id === id)).filter(Boolean) as typeof ALL_TRIGGERS;
              return (
                <div
                  key={ritual.id}
                  style={{ background: "#FFFFFF", border: "1px solid var(--border)", borderRadius: 22, padding: "22px 24px", boxShadow: "0 1px 4px rgba(44,53,49,0.04)" }}
                >
                  {/* Ritual header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: ritual.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={18} color="#fff" strokeWidth={1.6} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", marginBottom: 2 }}>{ritual.name}</p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Last used: {ritual.lastUsed}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ background: "var(--muted)", border: "none", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Pencil size={12} strokeWidth={1.8} color="var(--muted-foreground)" />
                      </button>
                      <button
                        onClick={() => deleteRitual(ritual.id)}
                        style={{ background: "#FEF0EE", border: "none", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Trash2 size={12} strokeWidth={1.8} color="#C0614A" />
                      </button>
                    </div>
                  </div>

                  {/* Trigger icons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {triggerObjs.map(({ id, icon: Icon, label }) => (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#EAF2EE", borderRadius: 20, padding: "5px 12px" }}>
                        <Icon size={12} strokeWidth={1.7} color="#4A6B5D" />
                        <span style={{ fontSize: 12, color: "#4A6B5D", fontWeight: 500 }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Evidence & CTA */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {ritual.evidence.map((ev) => {
                        const opt = EVIDENCE_OPTIONS.find(e => e.id === ev);
                        if (!opt) return null;
                        const { icon: EIcon } = opt;
                        return (
                          <div key={ev} style={{ width: 26, height: 26, borderRadius: 8, background: "#F2F4F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <EIcon size={12} strokeWidth={1.7} color="var(--muted-foreground)" />
                          </div>
                        );
                      })}
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#4A6B5D", border: "none", borderRadius: 12, padding: "8px 14px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 500 }}>
                      Start Routine <ChevronRight size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state if all deleted */}
            {rituals.length === 0 && (
              <div style={{ background: "#FFFFFF", border: "1.5px dashed var(--border)", borderRadius: 22, padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>No routines yet. Create one →</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: builder ── */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#F8FAF8", borderRadius: 24, padding: "28px 26px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6 }}>
              Ritual Builder
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", marginBottom: 24 }}>
              Create New Ritual
            </h3>

            {/* Name field */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 8, letterSpacing: "0.01em" }}>
                Ritual Name
              </label>
              <input
                value={ritualName}
                onChange={(e) => setRitualName(e.target.value)}
                placeholder="e.g. Leaving for Work"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12,
                  border: "1px solid var(--border)", background: "#FFFFFF",
                  fontSize: 13, color: "var(--foreground)", outline: "none",
                  fontFamily: "var(--font-family)",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4A6B5D")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Trigger selection */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 10, letterSpacing: "0.01em" }}>
                Include Triggers
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_TRIGGERS.map(({ id, icon: Icon, label }) => {
                  const checked = selectedTriggers.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleTrigger(id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                        background: checked ? "#EFF7F3" : "#FFFFFF",
                        border: checked ? "1.5px solid #4A6B5D" : "1px solid var(--border)",
                        outline: "none", textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: checked ? "#4A6B5D" : "#F2F4F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s ease" }}>
                        {checked
                          ? <Check size={13} color="#fff" strokeWidth={2.5} />
                          : <Icon size={13} strokeWidth={1.6} color="var(--muted-foreground)" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: checked ? 500 : 400, color: checked ? "#2C3531" : "var(--muted-foreground)" }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence toggles */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 10, letterSpacing: "0.01em" }}>
                Required Evidence
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {EVIDENCE_OPTIONS.map(({ id, icon: EIcon, label }) => {
                  const on = selectedEvidence.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleEvidence(id)}
                      style={{
                        flex: 1, padding: "9px 6px", borderRadius: 12, cursor: "pointer",
                        background: on ? "#4A6B5D" : "#FFFFFF",
                        border: on ? "none" : "1px solid var(--border)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                        outline: "none", transition: "all 0.15s ease",
                      }}
                    >
                      <EIcon size={14} strokeWidth={1.7} color={on ? "#fff" : "var(--muted-foreground)"} />
                      <span style={{ fontSize: 10, fontWeight: 500, color: on ? "#fff" : "var(--muted-foreground)", letterSpacing: "0.02em" }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)", margin: "0 0 20px" }} />

            {/* Mindful Anchor preview */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 14 }}>
                Anchor Button Preview
              </p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FFFFFF", borderRadius: 18, padding: "22px 16px", border: "1px solid var(--border)" }}>
                <div style={{ position: "relative", width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width={96} height={96} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                    <circle cx={48} cy={48} r={36} fill="none" stroke="#E8EDEA" strokeWidth={6} />
                    <circle cx={48} cy={48} r={36} fill="none" stroke="#4A6B5D" strokeWidth={6} strokeLinecap="round" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * 0.75} />
                  </svg>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(74,107,93,0.28)" }}>
                    <Shield size={20} color="#fff" strokeWidth={1.5} />
                  </div>
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", textAlign: "center", lineHeight: 1.5, maxWidth: 200 }}>
                  Hold for 3s to Secure{triggerLabels.length > 0 ? ` — ${ritualName || "Ritual"}` : ""}
                </p>
                {triggerLabels.length > 0 && (
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)", textAlign: "center", marginTop: 5 }}>
                    {triggerLabels.join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!ritualName.trim() || selectedTriggers.length === 0}
              style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none",
                background: saved ? "#4A9B6F" : (!ritualName.trim() || selectedTriggers.length === 0) ? "var(--muted)" : "#4A6B5D",
                color: (!ritualName.trim() || selectedTriggers.length === 0) ? "var(--muted-foreground)" : "#FFFFFF",
                fontSize: 14, fontWeight: 500, cursor: (!ritualName.trim() || selectedTriggers.length === 0) ? "not-allowed" : "pointer",
                transition: "background 0.25s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {saved ? <><Check size={15} strokeWidth={2.5} /> Ritual Saved</> : <><Plus size={15} strokeWidth={2} /> Save Ritual</>}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
