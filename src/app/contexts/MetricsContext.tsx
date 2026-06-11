import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const STORAGE_KEY = "memento_metrics";
const LAST_LOGIN_KEY = "memento_last_login";

export interface Metrics {
  mindfulMoments:    number; // cumulative seconds
  proofsConsulted:   number; // count
  anxietyDeescalated: number; // count
  daysOfTrust:       number; // streak days
  securedActions:    { completed: number; total: number };
  calmMinutes:       number; // cumulative minutes
}

const DEFAULT: Metrics = {
  mindfulMoments:    0,
  proofsConsulted:   0,
  anxietyDeescalated: 0,
  daysOfTrust:       0,
  securedActions:    { completed: 0, total: 0 },
  calmMinutes:       0,
};

interface MetricsValue {
  metrics: Metrics;
  addMindfulMoments:    (seconds: number) => void;
  addProofConsulted:    () => void;
  addAnxietyDeescalated: () => void;
  addCalmMinutes:       (minutes: number) => void;
  setSecuredTotal:      (total: number, done: number) => void;
}

const MetricsContext = createContext<MetricsValue | undefined>(undefined);

function loadMetrics(): Metrics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Metrics>;
      return {
        mindfulMoments:    parsed.mindfulMoments    ?? 0,
        proofsConsulted:   parsed.proofsConsulted   ?? 0,
        anxietyDeescalated: parsed.anxietyDeescalated ?? 0,
        daysOfTrust:       parsed.daysOfTrust       ?? 0,
        securedActions:    parsed.securedActions    ?? { completed: 0, total: 0 },
        calmMinutes:       parsed.calmMinutes       ?? 0,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT;
}

function checkStreak(current: number): number {
  try {
    const today = new Date().toDateString();
    const last  = localStorage.getItem(LAST_LOGIN_KEY);
    localStorage.setItem(LAST_LOGIN_KEY, today);
    if (!last) return 1;
    if (last === today) return current; // same day, no change
    const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
    return diff <= 1 ? current + 1 : 1;
  } catch {
    return current;
  }
}

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<Metrics>(() => {
    const loaded = loadMetrics();
    const streak = checkStreak(loaded.daysOfTrust);
    return { ...loaded, daysOfTrust: streak };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    } catch { /* ignore */ }
  }, [metrics]);

  function update(patch: Partial<Metrics> | ((prev: Metrics) => Partial<Metrics>)) {
    setMetrics(prev => {
      const delta = typeof patch === "function" ? patch(prev) : patch;
      return { ...prev, ...delta };
    });
  }

  function addMindfulMoments(seconds: number) {
    update(prev => ({ mindfulMoments: prev.mindfulMoments + seconds }));
  }

  function addProofConsulted() {
    update(prev => ({ proofsConsulted: prev.proofsConsulted + 1 }));
  }

  function addAnxietyDeescalated() {
    update(prev => ({ anxietyDeescalated: prev.anxietyDeescalated + 1 }));
  }

  function addCalmMinutes(minutes: number) {
    update(prev => ({ calmMinutes: prev.calmMinutes + minutes }));
  }

  function setSecuredTotal(total: number, done: number) {
    update(() => ({
      securedActions: { total, completed: done },
    }));
  }

  return (
    <MetricsContext.Provider value={{
      metrics,
      addMindfulMoments,
      addProofConsulted,
      addAnxietyDeescalated,
      addCalmMinutes,
      setSecuredTotal,
    }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error("useMetrics must be used within MetricsProvider");
  return ctx;
}
