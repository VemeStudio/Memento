import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weekData = [
  { day: "Mon", level: 7.2 },
  { day: "Tue", level: 6.5 },
  { day: "Wed", level: 8.1 },
  { day: "Thu", level: 5.8 },
  { day: "Fri", level: 4.9 },
  { day: "Sat", level: 3.7 },
  { day: "Sun", level: 3.2 },
];

interface Props {
  onLogAnxiety: () => void;
}

export function AnxietyTracker({ onLogAnxiety }: Props) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        border: "1px solid var(--border)",
        padding: "20px 24px",
        minWidth: 280,
        boxShadow: "0 2px 16px rgba(44,53,49,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted-foreground)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Anxiety This Week
        </p>
        <span
          style={{
            fontSize: 11,
            color: "#4A9B6F",
            fontWeight: 500,
            background: "#EAF5EE",
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          ↓ 55% calmer
        </span>
      </div>

      <div style={{ height: 64, margin: "8px -8px", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
            <defs>
              <linearGradient id="anxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A6B5D" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4A6B5D" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#7A8A84" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 10]} hide />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--foreground)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              itemStyle={{ color: "#4A6B5D" }}
              formatter={(v: number) => [`${v}/10`, "Level"]}
            />
            <Area
              type="monotone"
              dataKey="level"
              stroke="#4A6B5D"
              strokeWidth={2}
              fill="url(#anxGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#4A6B5D", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={onLogAnxiety}
        className="w-full mt-3 transition-all duration-200"
        style={{
          background: "var(--primary)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 12,
          padding: "9px 16px",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#3A5A4D";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)";
        }}
      >
        Log Current Anxiety State (1–10)
      </button>
    </div>
  );
}
