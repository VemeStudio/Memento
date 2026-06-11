# Unified Data Synchronization Guide

## Overview
The app now uses a **single localStorage key** (`memento_cards`) to store BOTH card definitions and their statuses. This ensures perfect synchronization between the Dashboard and Routines pages.

---

## 🔑 Single Storage Key

### Key: `memento_cards`

Stores ALL cards with their statuses in one array:

```json
[
  {
    "id": "front-door",
    "label": "Front Door",
    "description": "Check if front door is locked",
    "iconId": "door",
    "status": "Secure",
    "isCustom": false,
    "createdAt": "2024-03-08T10:00:00.000Z",
    "lastChecked": "2024-03-08T14:30:00.000Z"
  },
  {
    "id": "gas-stoves",
    "label": "Gas Stoves",
    "description": "Check if all stoves are turned off",
    "iconId": "flame",
    "status": "Pending",
    "isCustom": false,
    "createdAt": "2024-03-08T10:00:00.000Z"
  },
  {
    "id": "custom-1709876543210-x3k9m2p",
    "label": "Bedroom Window",
    "description": "Check if window is locked",
    "iconId": "window",
    "status": "Pending",
    "isCustom": true,
    "createdAt": "2024-03-08T10:15:43.210Z"
  }
]
```

---

## 🔄 Data Synchronization Flow

### How Pages Stay in Sync

```
┌──────────────────────────────────────────────────────────────┐
│                    UnifiedCardsContext                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  State: cards[] (UnifiedCard[])                    │    │
│  │                                                     │    │
│  │  useEffect(() => {                                 │    │
│  │    localStorage.setItem("memento_cards", cards)    │    │
│  │  }, [cards])                                       │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │                                   │
│              ┌───────────┴───────────┐                      │
│              │                       │                       │
│              ▼                       ▼                       │
│      ┌──────────────┐        ┌──────────────┐              │
│      │  Dashboard   │        │   Routines   │              │
│      │              │        │              │              │
│      │ const {cards}│        │ const {cards}│              │
│      │   = useUnif..│        │   = useUnif..│              │
│      └──────────────┘        └──────────────┘              │
│                                                              │
│  When ANY change happens:                                   │
│  1. Context updates cards[]                                 │
│  2. useEffect auto-saves to localStorage                    │
│  3. Both pages re-render with new data                      │
└──────────────────────────────────────────────────────────────┘
```

### Real-Time Sync Examples

**Example 1: Add Card on Dashboard**
```tsx
// User clicks "Add custom check" on Dashboard
addCard({ label: "Garage", iconId: "garage" })
  ↓
// Context creates card with unique ID
{ id: "custom-123", label: "Garage", status: "Pending", ... }
  ↓
// Auto-saves to localStorage ("memento_cards")
  ↓
// Routines page AUTOMATICALLY sees new card
// (no manual refresh needed)
```

**Example 2: Update Status on Dashboard**
```tsx
// User completes 3-second hold
updateCardStatus("front-door", "Secure")
  ↓
// Context updates card in array
cards[0].status = "Secure"
cards[0].lastChecked = "2024-03-08T14:30:00.000Z"
  ↓
// Auto-saves to localStorage
  ↓
// If user switches to Routines tab, status is already updated
```

**Example 3: Reset Session**
```tsx
// User clicks "Start a new session"
resetAllStatuses()
  ↓
// Context loops through ALL cards
cards.forEach(card => {
  card.status = "Pending"
  card.lastChecked = undefined
})
  ↓
// Auto-saves to localStorage
  ↓
// Cards are kept, only statuses reset
// Both Dashboard and Routines show "Pending"
```

---

## 🎯 Key Functions

### 1. `handleStartNewSession` (Updated)

**Location:** `StartNewSessionButton.tsx`

**OLD Behavior (Before):**
```tsx
// ❌ Deleted custom cards
localStorage.removeItem("memento_card_statuses");
localStorage.removeItem("memento_custom_cards");
window.location.reload();
```

**NEW Behavior (Now):**
```tsx
// ✅ Keeps all cards, resets statuses only
const handleStartNewSession = () => {
  // 1. Read cards from localStorage ("memento_cards")
  // 2. Loop through ALL cards (default + custom)
  // 3. Set each card's status to "Pending"
  // 4. Clear lastChecked timestamps
  // 5. Save updated array back to localStorage
  resetAllStatuses();
  
  // 6. Refresh page
  setTimeout(() => window.location.reload(), 100);
};
```

**What happens to cards:**
```json
// BEFORE reset:
[
  { "id": "front-door", "status": "Secure", ... },
  { "id": "custom-123", "status": "Secure", ... }
]

// AFTER reset:
[
  { "id": "front-door", "status": "Pending", "lastChecked": undefined },
  { "id": "custom-123", "status": "Pending", "lastChecked": undefined }
]
```

### 2. `Routines.tsx` (Updated)

**OLD Behavior (Before):**
```tsx
// ❌ Used static data
const ITEMS = [
  { id: "front-door", icon: DoorOpen, label: "Front Door" },
  { id: "gas-stoves", icon: Flame, label: "Gas Stoves" },
  // ... static list
];
```

**NEW Behavior (Now):**
```tsx
// ✅ Reads from same localStorage key dynamically
const { cards } = useUnifiedCards();

// Transform cards array for UI
const ITEMS = useMemo(() => {
  return cards.map((card) => ({
    id: card.id,
    icon: getIconById(card.iconId),
    label: card.label,
    desc: card.description || "Check trigger status",
  }));
}, [cards]);

// Auto-updates when cards change:
// - New card added → appears in list
// - Card deleted → removed from list  
// - Session reset → all cards still there
```

**useEffect for Dynamic Updates:**
```tsx
// Syncs enabled state when cards array changes
useEffect(() => {
  setEnabled((prev) => {
    const updated = { ...prev };
    
    // Add new cards as disabled by default
    cards.forEach((card) => {
      if (!(card.id in updated)) {
        updated[card.id] = false;
      }
    });
    
    // Remove deleted cards
    Object.keys(updated).forEach((id) => {
      if (!cards.find((c) => c.id === id)) {
        delete updated[id];
      }
    });
    
    return updated;
  });
}, [cards]);
```

---

## 📦 Data Model

### UnifiedCard Interface

```tsx
interface UnifiedCard {
  id: string;              // Unique identifier
  label: string;           // Display name
  description?: string;    // Optional description
  iconId: string;          // Icon identifier (e.g., "door", "window")
  status: "Pending" | "Secure";  // Progress status
  isCustom: boolean;       // true = user-created, false = default
  createdAt: string;       // ISO timestamp
  lastChecked?: string;    // ISO timestamp of last verification
}
```

---

## 🔧 Context API Methods

### `useUnifiedCards()` Hook

```tsx
const {
  cards,              // UnifiedCard[] - All cards
  addCard,            // Add new custom card
  removeCard,         // Remove card by ID (custom only)
  updateCardStatus,   // Update status (Pending → Secure)
  updateCard,         // Update any card property
  resetAllStatuses,   // Reset all statuses to Pending
} = useUnifiedCards();
```

### Method Details

**1. addCard**
```tsx
addCard({
  label: "Bedroom Window",
  description: "Check if locked",
  iconId: "window",
})
// Creates:
{
  id: "custom-1709876543210-x3k9m2p",  // Generated
  label: "Bedroom Window",
  description: "Check if locked",
  iconId: "window",
  status: "Pending",                    // Default
  isCustom: true,                       // Auto-set
  createdAt: "2024-03-08T10:15:43.210Z" // Auto-set
}
```

**2. updateCardStatus**
```tsx
updateCardStatus("front-door", "Secure")
// Updates:
{
  ...card,
  status: "Secure",
  lastChecked: "2024-03-08T14:30:00.000Z"
}
```

**3. resetAllStatuses**
```tsx
resetAllStatuses()
// Loops through ALL cards:
cards.map(card => ({
  ...card,
  status: "Pending",
  lastChecked: undefined
}))
```

---

## 🔄 Migration from Old System

### Old System (3 separate storage keys)

```json
// localStorage.getItem("memento_card_statuses")
{
  "front-door": "Secure",
  "gas-stoves": "Pending"
}

// localStorage.getItem("memento_custom_cards")
[
  { "id": "custom-123", "label": "Window", "iconId": "window" }
]

// localStorage.getItem("card_definitions") (implicit in code)
// No storage - hardcoded in CARD_DEFINITIONS array
```

### New System (1 unified storage key)

```json
// localStorage.getItem("memento_cards")
[
  {
    "id": "front-door",
    "label": "Front Door",
    "iconId": "door",
    "status": "Secure",    // ← Combined with status
    "isCustom": false
  },
  {
    "id": "custom-123",
    "label": "Window",
    "iconId": "window",
    "status": "Pending",   // ← Combined with status
    "isCustom": true
  }
]
```

---

## ✅ Benefits of Unified System

### 1. **Single Source of Truth**
- No sync issues between separate storage keys
- Card definitions and statuses always in sync
- Impossible to have orphaned statuses

### 2. **Automatic Cross-Page Sync**
- Dashboard adds card → Routines sees it immediately
- Dashboard resets session → Routines reflects changes
- No manual event emitters or pub/sub needed

### 3. **Simpler State Management**
- One context instead of two
- One useEffect for persistence instead of multiple
- One localStorage key to manage

### 4. **Better Session Reset**
```tsx
// OLD: Delete everything
localStorage.removeItem("memento_card_statuses");
localStorage.removeItem("memento_custom_cards");
// User loses all custom cards ❌

// NEW: Reset progress only
resetAllStatuses();
// User keeps all custom cards ✅
```

### 5. **Easier Testing**
```tsx
// Clear test data
localStorage.removeItem("memento_cards");

// Seed test data
localStorage.setItem("memento_cards", JSON.stringify([
  { id: "test-1", status: "Pending", ... }
]));
```

---

## 🧪 Testing the System

### Test 1: Add Card on Dashboard
1. Open Dashboard
2. Click "+ Add custom check"
3. Create "Test Window" card
4. Switch to Routines tab
5. ✅ New card appears in Routines list

### Test 2: Reset Session
1. Create custom card
2. Mark it as "Secure"
3. Click "Start a new session"
4. ✅ Custom card still exists
5. ✅ Status is reset to "Pending"

### Test 3: Verify localStorage
```js
// In browser console
const data = JSON.parse(localStorage.getItem("memento_cards"));
console.log(data);
// Should show array with all cards + statuses
```

### Test 4: Cross-Tab Sync
1. Open app in two browser tabs
2. Add card in Tab 1
3. Refresh Tab 2
4. ✅ New card appears in Tab 2

---

## 📊 Data Flow Diagram

```
User Action (Dashboard)
        ↓
  Click "Hold Button"
        ↓
updateCardStatus("front-door", "Secure")
        ↓
┌─────────────────────────────────┐
│  UnifiedCardsContext            │
│                                 │
│  setCards(prev => prev.map(...))│
│        ↓                        │
│  cards[0].status = "Secure"     │
│        ↓                        │
│  useEffect triggers             │
│        ↓                        │
│  localStorage.setItem(          │
│    "memento_cards",             │
│    JSON.stringify(cards)        │
│  )                              │
└─────────────────────────────────┘
        ↓
  Both pages re-render
        ↓
┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │   Routines   │
│              │  │              │
│ Shows card   │  │ Shows card   │
│ as "Secure"  │  │ as "Secure"  │
└──────────────┘  └──────────────┘
```

---

## 🔍 Troubleshooting

### Cards not syncing between pages?
1. Check console for errors
2. Verify `UnifiedCardsProvider` wraps app in App.tsx
3. Clear localStorage and reload: `localStorage.clear()`

### Session reset deleting cards?
- Check that you're calling `resetAllStatuses()` not `localStorage.clear()`
- Verify StartNewSessionButton imports `useUnifiedCards`

### Routines page showing old data?
- Verify Routines.tsx uses `useUnifiedCards()` hook
- Check `useMemo` dependencies include `[cards]`
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### localStorage full?
```tsx
// Check usage
console.log(localStorage.getItem("memento_cards").length);
// Typical: <10KB for 20-30 cards
```

---

## 📝 Summary

✅ **Single localStorage key**: `memento_cards`  
✅ **Unified data model**: Card + Status in one object  
✅ **Auto-sync**: Changes propagate instantly  
✅ **Session reset**: Keeps cards, resets statuses only  
✅ **Routines page**: Reads dynamically from same source  
✅ **Type-safe**: Full TypeScript support  
✅ **Production-ready**: Error handling, validation, documentation  

The system now provides seamless synchronization across all pages with a single source of truth.
