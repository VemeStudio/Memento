import { useMetrics } from "../contexts/MetricsContext";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { useIsMobile } from "../hooks/useIsMobile";
import { Clock, Eye, HeartPulse, Sparkles, CheckCircle, Wind, Leaf } from "lucide-react";
import { LanguageSelector } from "../components/LanguageSelector";
import { useLang } from "../contexts/LangContext";


const METRIC_ICONS = {
  mindful:  { icon: Clock,       ibg: "#EAF2EE", ic: "#4A6B5D" },
  proofs:   { icon: Eye,         ibg: "#EEF3FF", ic: "#5B6FA6" },
  anxiety:  { icon: HeartPulse,  ibg: "#FEF3E2", ic: "#B06B20" },
  trust:    { icon: Sparkles,    ibg: "#F3EEF9", ic: "#7B56B0" },
  secured:  { icon: CheckCircle, ibg: "#EAF5EE", ic: "#3A7A52" },
  calm:     { icon: Wind,        ibg: "#EAF2EE", ic: "#4A8C7A" },
} as const;


export function MyVictories() {
  const isMobile = useIsMobile();
  const { t } = useLang();

  const { metrics } = useMetrics();
  const { mindfulMoments, proofsConsulted, anxietyDeescalated, daysOfTrust, securedActions, calmMinutes } = metrics;

  const METRICS = [
    { id: "mindful",  ...METRIC_ICONS.mindful,  label: t.victories.mindfulLabel, subtitle: t.victories.mindfulSub,  value: `${mindfulMoments}s`  },
    { id: "proofs",   ...METRIC_ICONS.proofs,   label: t.victories.proofsLabel,  subtitle: t.victories.proofsSub,   value: `${proofsConsulted}`   },
    { id: "anxiety",  ...METRIC_ICONS.anxiety,  label: t.victories.anxietyLabel, subtitle: t.victories.anxietySub,  value: `${anxietyDeescalated}` },
    { id: "trust",    ...METRIC_ICONS.trust,    label: t.victories.trustLabel,   subtitle: t.victories.trustSub,    value: `${daysOfTrust}`        },
    { id: "secured",  ...METRIC_ICONS.secured,  label: t.victories.securedLabel, subtitle: t.victories.securedSub,  value: `${securedActions.completed}/${securedActions.total}` },
    { id: "calm",     ...METRIC_ICONS.calm,     label: t.victories.calmLabel,    subtitle: t.victories.calmSub,     value: `${calmMinutes}`        },
  ];

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100dvh", background: "#FBFBF9", fontFamily: "var(--font-family)", display: "flex", flexDirection: "column" }}>

        <header style={{ padding: "16px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(44,53,49,0.08)", background: "#FBFBF9", position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#4A6B5D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Leaf size={13} color="#fff" strokeWidth={1.9} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t.victories.title}</p>
              <p style={{ fontSize: 11, color: "#7A8A84" }}>{t.victories.subtitle}</p>
            </div>
          </div>
          <LanguageSelector compact />
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", paddingBottom: 96 }}>

          {/* 6 metric cards — 2-column grid on mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {METRICS.map(({ id, icon: Icon, label, subtitle, value, ibg, ic }) => (
              <div key={id} style={{ background: "#fff", borderRadius: 20, padding: "16px 16px", border: "1px solid rgba(44,53,49,0.09)", boxShadow: "0 1px 3px rgba(44,53,49,0.04)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: ibg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.6} color={ic} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <p style={{ fontSize: 26, fontWeight: 600, color: "#2C3531", letterSpacing: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#2C3531", lineHeight: 1.3 }}>{label}</p>
                  <p style={{ fontSize: 10, color: "#7A8A84", lineHeight: 1.5 }}>{subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{ background: "#F8FAF8", borderRadius: 20, padding: "20px 20px", border: "1px solid rgba(44,53,49,0.09)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Sparkles size={13} strokeWidth={1.7} color="#4A6B5D" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#2C3531", fontStyle: "italic", marginBottom: 14 }}>
              {t.victories.quote}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>M</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#2C3531" }}>{t.victories.quoteFooter}</p>
                <p style={{ fontSize: 11, color: "#7A8A84" }}>{t.victories.quoteSub}</p>
              </div>
            </div>
          </div>
        </div>

        <MobileNav />
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FBFBF9", fontFamily: "var(--font-family)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        <header style={{ height: 68, borderBottom: "1px solid rgba(44,53,49,0.08)", padding: "0 36px", display: "flex", alignItems: "center", flexShrink: 0, background: "#FBFBF9" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#2C3531", letterSpacing: "-0.02em" }}>{t.victories.title}</p>
            <p style={{ fontSize: 12, color: "#7A8A84", marginTop: 1 }}>{t.victories.subtitle}</p>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "30px 36px" }}>

          {/* 6 metric cards — 3-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15, marginBottom: 22 }}>
            {METRICS.map(({ id, icon: Icon, label, subtitle, value, ibg, ic }) => (
              <div key={id} style={{ background: "#fff", borderRadius: 22, padding: "20px 22px", border: "1px solid rgba(44,53,49,0.09)", boxShadow: "0 1px 3px rgba(44,53,49,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: ibg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} strokeWidth={1.6} color={ic} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <p style={{ fontSize: 32, fontWeight: 600, color: "#2C3531", letterSpacing: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#2C3531", lineHeight: 1.35 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "#7A8A84", lineHeight: 1.5 }}>{subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#F8FAF8", borderRadius: 22, padding: "22px 22px", border: "1px solid rgba(44,53,49,0.09)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EAF2EE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Sparkles size={14} strokeWidth={1.7} color="#4A6B5D" />
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "#2C3531", fontStyle: "italic" }}>
                  {t.victories.quote}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7EA896,#4A6B5D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>M</span>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#2C3531" }}>{t.victories.quoteFooter}</p>
                  <p style={{ fontSize: 11, color: "#7A8A84" }}>{t.victories.quoteSub}</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}