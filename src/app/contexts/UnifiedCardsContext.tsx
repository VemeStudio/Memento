import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type LucideIcon, DoorOpen, Flame, AppWindow, Lightbulb } from "lucide-react";

/**
 * UNIFIED CARD DATA MODEL
 * Combines card definition + status in a single object
 */
export interface UnifiedCard {
  id: string;
  label: string;
  description?: string;
  iconId: string;
  status: "Pending" | "Secure";
  isCustom: boolean;
  visible: boolean;
  isActive: boolean; // Saved from Routine Builder; drives Dashboard grid + Routines lists
  createdAt: string;
  lastChecked?: string;
  photoData?: string;
  audioData?: string;
}

interface UnifiedCardsContextValue {
  cards: UnifiedCard[];
  addCard: (card: Omit<UnifiedCard, "id" | "createdAt" | "status" | "isCustom" | "visible" | "isActive">) => void;
  removeCard: (id: string) => void;
  updateCardStatus: (id: string, status: "Pending" | "Secure") => void;
  updateCard: (id: string, updates: Partial<UnifiedCard>) => void;
  toggleCardVisibility: (id: string) => void;
  saveActiveItems: (activeIds: string[]) => void;
  resetAllStatuses: () => void;
}

const UnifiedCardsContext = createContext<UnifiedCardsContextValue | undefined>(undefined);

/**
 * SINGLE STORAGE KEY - Used for both card definitions AND statuses
 */
const STORAGE_KEY = "memento_cards";
const DELETED_IDS_KEY = "memento_deleted_ids";
const MEDIA_PREFIX = "memento_media_";

function saveMedia(id: string, photo: string | undefined, audio: string | undefined) {
  try {
    if (photo) localStorage.setItem(`${MEDIA_PREFIX}photo_${id}`, photo);
    else localStorage.removeItem(`${MEDIA_PREFIX}photo_${id}`);
    if (audio) localStorage.setItem(`${MEDIA_PREFIX}audio_${id}`, audio);
    else localStorage.removeItem(`${MEDIA_PREFIX}audio_${id}`);
  } catch { /* quota — media simply won't persist */ }
}

function loadMedia(id: string): { photoData?: string; audioData?: string } {
  try {
    const photo = localStorage.getItem(`${MEDIA_PREFIX}photo_${id}`) ?? undefined;
    const audio = localStorage.getItem(`${MEDIA_PREFIX}audio_${id}`) ?? undefined;
    return { photoData: photo, audioData: audio };
  } catch { return {}; }
}

/**
 * DEFAULT CARDS - Built-in cards that always exist
 */
const DEFAULT_CARDS: UnifiedCard[] = [
  {
    id: "front-door",
    label: "Front Door",
    description: "Check if front door is locked",
    iconId: "door",
    status: "Pending",
    isCustom: false,
    visible: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gas-stoves",
    label: "Gas Stoves",
    description: "Check if all stoves are turned off",
    iconId: "flame",
    status: "Pending",
    isCustom: false,
    visible: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "living-windows",
    label: "Living Room Windows",
    description: "Check if all windows are closed",
    iconId: "window",
    status: "Pending",
    isCustom: false,
    visible: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lights",
    label: "Lights",
    description: "Check if all lights are turned off",
    iconId: "light",
    status: "Pending",
    isCustom: false,
    visible: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * UnifiedCardsProvider
 * Manages ALL cards (default + custom) with statuses in one place
 * Uses SINGLE localStorage key: "memento_cards"
 */
export function UnifiedCardsProvider({ children }: { children: ReactNode }) {
  // Tracks IDs of default cards the user has explicitly deleted — persisted so
  // they are never resurrected on mount or after "Start New Session".
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(DELETED_IDS_KEY);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [cards, setCards] = useState<UnifiedCard[]>(() => {
    // Load from localStorage on mount
    try {
      const storedDeleted: Set<string> = (() => {
        try {
          const s = localStorage.getItem(DELETED_IDS_KEY);
          return s ? new Set<string>(JSON.parse(s)) : new Set<string>();
        } catch { return new Set<string>(); }
      })();

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const defaultIds = DEFAULT_CARDS.map(c => c.id);
        const storedCustomCards = parsed.filter((c: UnifiedCard) => !defaultIds.includes(c.id));
        const storedDefaults = parsed.filter((c: UnifiedCard) => defaultIds.includes(c.id));

        // Default cards always reappear; deletedIds only gates custom cards
        const mergedDefaults = DEFAULT_CARDS
          .map(defaultCard => {
            const found = storedDefaults.find((c: UnifiedCard) => c.id === defaultCard.id);
            const merged = found || defaultCard;
            return { ...merged, visible: merged.visible ?? true, isActive: merged.isActive ?? true, ...loadMedia(defaultCard.id) };
          });

        const migratedCustom = storedCustomCards.map((c: UnifiedCard) => ({
          ...c,
          visible: c.visible ?? true,
          isActive: c.isActive ?? true,
          ...loadMedia(c.id),
        }));

        return [...mergedDefaults, ...migratedCustom];
      }
    } catch (error) {
      console.error("Failed to load cards from localStorage:", error);
    }
    return DEFAULT_CARDS;
  });

  /**
   * ════════════════════════════════════════════════════════════════
   * AUTO-PERSIST TO LOCALSTORAGE
   * Saves entire cards array on every state change
   * ════════════════════════════════════════════════════════════════
   */
  useEffect(() => {
    try {
      // Strip media blobs before writing — they live in separate keys
      const slim = cards.map(({ photoData: _p, audioData: _a, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch (error) {
      console.error("Failed to save cards to localStorage:", error);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...deletedIds]));
    } catch (error) {
      console.error("Failed to save deleted ids to localStorage:", error);
    }
  }, [deletedIds]);

  /**
   * Add a new custom card
   */
  const addCard = (card: Omit<UnifiedCard, "id" | "createdAt" | "status" | "isCustom" | "visible" | "isActive">) => {
    const newCard: UnifiedCard = {
      ...card,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: "Pending",
      isCustom: true,
      visible: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCards((prev) => [...prev, newCard]);
    return newCard;
  };

  /**
   * Remove a card (only custom cards can be removed)
   */
  const removeCard = (id: string) => {
    const isDefault = DEFAULT_CARDS.some(c => c.id === id);
    if (!isDefault) {
      setDeletedIds((prev) => new Set([...prev, id]));
    }
    saveMedia(id, undefined, undefined);
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  /**
   * Update a card's status (Pending → Secure)
   */
  const updateCardStatus = (id: string, status: "Pending" | "Secure") => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, status, lastChecked: new Date().toISOString() }
          : card
      )
    );
  };

  /**
   * Set isActive for all cards at once based on the Routine Builder selection.
   * Cards whose id is in activeIds get isActive: true; all others get false.
   */
  const saveActiveItems = (activeIds: string[]) => {
    setCards((prev) =>
      prev.map((card) => ({ ...card, isActive: activeIds.includes(card.id) }))
    );
  };

  /**
   * Toggle Dashboard visibility for a card (controlled from Routines)
   */
  const toggleCardVisibility = (id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, visible: !card.visible } : card
      )
    );
  };

  /**
   * Update any card property
   */
  const updateCard = (id: string, updates: Partial<UnifiedCard>) => {
    if (updates.photoData !== undefined || updates.audioData !== undefined) {
      const card = cards.find(c => c.id === id);
      saveMedia(id, updates.photoData ?? card?.photoData, updates.audioData ?? card?.audioData);
    }
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  /**
   * ════════════════════════════════════════════════════════════════
   * RESET ALL STATUSES (for "Start New Session")
   * Loops through ALL cards and sets status back to "Pending"
   * KEEPS all cards (default + custom) intact
   * ════════════════════════════════════════════════════════════════
   */
  const resetAllStatuses = () => {
    setCards((prev) => {
      const clean = prev.map((card) => {
        saveMedia(card.id, undefined, undefined);
        return { ...card, status: "Pending" as const, lastChecked: undefined, photoData: undefined, audioData: undefined };
      });
      return clean;
    });
  };

  return (
    <UnifiedCardsContext.Provider
      value={{
        cards,
        addCard,
        removeCard,
        updateCardStatus,
        updateCard,
        toggleCardVisibility,
        saveActiveItems,
        resetAllStatuses,
      }}
    >
      {children}
    </UnifiedCardsContext.Provider>
  );
}

export function useUnifiedCards() {
  const context = useContext(UnifiedCardsContext);
  if (!context) {
    throw new Error("useUnifiedCards must be used within UnifiedCardsProvider");
  }
  return context;
}
