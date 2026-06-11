import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CardStatus = "Pending" | "Secure";

interface CardStatusState {
  [cardId: string]: CardStatus;
}

interface CardStatusContextValue {
  getStatus: (cardId: string) => CardStatus;
  setStatus: (cardId: string, status: CardStatus) => void;
}

const CardStatusContext = createContext<CardStatusContextValue | undefined>(undefined);

const STORAGE_KEY = "memento_card_statuses";

const DEFAULT_STATUSES: CardStatusState = {
  "front-door": "Pending",
  "gas-stoves": "Pending",
  "living-windows": "Pending",
  "lights": "Pending",
};

export function CardStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<CardStatusState>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATUSES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load card statuses:", error);
    }
    return DEFAULT_STATUSES;
  });

  // Persist to localStorage whenever statuses change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error("Failed to save card statuses:", error);
    }
  }, [statuses]);

  const getStatus = (cardId: string): CardStatus => {
    return statuses[cardId] || "Pending";
  };

  const setStatus = (cardId: string, status: CardStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [cardId]: status,
    }));
  };

  return (
    <CardStatusContext.Provider value={{ getStatus, setStatus }}>
      {children}
    </CardStatusContext.Provider>
  );
}

export function useCardStatus() {
  const context = useContext(CardStatusContext);
  if (!context) {
    throw new Error("useCardStatus must be used within CardStatusProvider");
  }
  return context;
}
