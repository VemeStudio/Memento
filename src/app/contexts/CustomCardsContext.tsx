import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

/**
 * CustomCard Interface
 * Represents a user-created custom check card
 */
export interface CustomCard {
  id: string;
  label: string;
  description?: string;
  iconId: string;
  createdAt: string;
}

interface CustomCardsContextValue {
  customCards: CustomCard[];
  addCustomCard: (card: Omit<CustomCard, "id" | "createdAt">) => void;
  removeCustomCard: (id: string) => void;
  updateCustomCard: (id: string, updates: Partial<CustomCard>) => void;
}

const CustomCardsContext = createContext<CustomCardsContextValue | undefined>(undefined);

const STORAGE_KEY = "memento_custom_cards";

/**
 * CustomCardsProvider
 * Manages custom user-created cards with localStorage persistence
 */
export function CustomCardsProvider({ children }: { children: ReactNode }) {
  const [customCards, setCustomCards] = useState<CustomCard[]>(() => {
    // Load custom cards from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load custom cards:", error);
    }
    return [];
  });

  // Persist to localStorage whenever customCards change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCards));
    } catch (error) {
      console.error("Failed to save custom cards:", error);
    }
  }, [customCards]);

  /**
   * Add a new custom card
   * Generates unique ID and timestamp
   */
  const addCustomCard = (card: Omit<CustomCard, "id" | "createdAt">) => {
    const newCard: CustomCard = {
      ...card,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setCustomCards((prev) => [...prev, newCard]);
    return newCard;
  };

  /**
   * Remove a custom card by ID
   */
  const removeCustomCard = (id: string) => {
    setCustomCards((prev) => prev.filter((card) => card.id !== id));
  };

  /**
   * Update a custom card
   */
  const updateCustomCard = (id: string, updates: Partial<CustomCard>) => {
    setCustomCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  return (
    <CustomCardsContext.Provider
      value={{ customCards, addCustomCard, removeCustomCard, updateCustomCard }}
    >
      {children}
    </CustomCardsContext.Provider>
  );
}

export function useCustomCards() {
  const context = useContext(CustomCardsContext);
  if (!context) {
    throw new Error("useCustomCards must be used within CustomCardsProvider");
  }
  return context;
}
