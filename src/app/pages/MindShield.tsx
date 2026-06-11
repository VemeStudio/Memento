import { PageLayout } from "../components/PageLayout";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ShieldCheck, Clock, Sparkles, TrendingUp } from "lucide-react";

const chartData = [
  { day: "Jun 1",  deflected: 3 },
  { day: "Jun 3",  deflected: 5 },
  { day: "Jun 5",  deflected: 4 },
  { day: "Jun 7",  deflected: 7 },
  { day: "Jun 9",  deflected: 6 },
  { day: "Jun 11", deflected: 9 },
  { day: "Jun 13", deflected: 8 },
  { day: "Jun 15", deflected: 11 },
  { day: "Jun 17", deflected: 10 },
  { day: "Jun 19", deflected: 13 },
  { day: "Jun 21", deflected: 12 },
  { day: "Jun 23", deflected: 15 },
  { day: "Jun 25", deflected: 14 },
  { day: "Jun 27", deflected: 16 },
  { day: "Jun 29", deflected: 18 },
];

const weeklyComparison = [
  { week: "Wk 1", avoided: 18 },
  { week: "Wk 2", avoided: 27 },
  { week: "Wk 3", avoided: 35 },
  { week: "Wk 4", avoided: 47 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 16px rgba(44,53,49,0.1)", fontSize: 13 }}>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#4A6B5D", fontWeight: 600 }}>{payload[0].value} crises deflected</p>
    </div>
  );
}

export function MindShield() {
  return (
    <PageLayout
      activePage="Mind Shield"
      headerLeft={
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            Mind Shield
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
            Celebrate your victories. Look how far you've come.
          </p>
        </div>
      }
    >
      <div style={{ padding: "40px 40px", maxWidth: 1100 }}>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 28 }}>

          {/* Compulsions Avoided */}
          <div style={{ background: "#fff", borderRadius: 22, padding: "28px 28px", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(44,53,49,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={21} strokeWidth={1.6} color="#4A6B5D" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#3A7A52", background: "#EAF5EE", padding: "4px 10px", borderRadius: 20 }}>
                +12 vs last week
              </span>
            </div>
            <p style={{ fontSize: 42, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>47</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>Compulsions Avoided</p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>This week alone</p>
          </div>

          {/* Time Saved */}
          <div style={{ background: "#fff", borderRadius: 22, padding: "28px 28px", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(44,53,49,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#FEF3E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={21} strokeWidth={1.6} color="#B06B20" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#3A7A52", background: "#EAF5EE", padding: "4px 10px", borderRadius: 20 }}>
                +40 min vs last week
              </span>
            </div>
            <p style={{ fontSize: 42, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>3.5h</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>Time Saved</p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Reclaimed from double-checking</p>
          </div>

          {/* Peace of Mind Rate */}
          <div style={{ background: "linear-gradient(135deg, #4A6B5D 0%, #3A5A4D 100%)", borderRadius: 22, padding: "28px 28px", boxShadow: "0 4px 20px rgba(74,107,93,0.22)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={21} strokeWidth={1.6} color="#fff" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 20 }}>
                ↑ from 74% last month
              </span>
            </div>
            <p style={{ fontSize: 42, fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>88%</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>Peace of Mind Rate</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Successful mindful actions</p>
          </div>
        </div>

        {/* ── Area chart ── */}
        <div style={{ background: "#fff", borderRadius: 22, padding: "28px 28px 20px", border: "1px solid var(--border)", marginBottom: 28, boxShadow: "0 1px 4px rgba(44,53,49,0.04)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", marginBottom: 3 }}>
                Crises Deflected Over Time
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Each point is a moment you chose trust over fear. June 2026.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#EAF5EE", borderRadius: 20, padding: "5px 12px" }}>
              <TrendingUp size={13} strokeWidth={2} color="#3A7A52" />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#3A7A52" }}>+500% since start</span>
            </div>
          </div>

          <div style={{ height: 240, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4A6B5D" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4A6B5D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(44,53,49,0.06)" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#7A8A84" }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#7A8A84" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(74,107,93,0.15)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="deflected"
                  stroke="#4A6B5D"
                  strokeWidth={2.5}
                  fill="url(#shieldGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#4A6B5D", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom two-col row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* Weekly progress bar */}
          <div style={{ background: "#fff", borderRadius: 22, padding: "24px 26px", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(44,53,49,0.04)" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginBottom: 4, letterSpacing: "-0.01em" }}>Weekly Progress</p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 20 }}>Compulsions avoided per week this month</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {weeklyComparison.map(({ week, avoided }) => (
                <div key={week}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{week}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{avoided}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 20, background: "#F2F4F2", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(avoided / 50) * 100}%`,
                        borderRadius: 20,
                        background: week === "Wk 4"
                          ? "linear-gradient(90deg,#4A6B5D,#7EA896)"
                          : "#B5C5BE",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspirational quote */}
          <div
            style={{
              borderRadius: 22,
              background: "#F8FAF8",
              border: "1px solid var(--border)",
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Sparkles size={16} strokeWidth={1.7} color="#4A6B5D" />
              </div>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: "#2C3531",
                  fontWeight: 400,
                  marginBottom: 20,
                }}
              >
                "Every time you resist a compulsion, you rewire your brain. You are not broken — you are actively healing. The doubt you feel is a symptom, not a signal. Your memory is trustworthy."
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>M</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>Memento Daily Reminder</p>
                <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Based on CBT & ERP principles</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
