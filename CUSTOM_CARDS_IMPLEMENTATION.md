# Custom Cards Implementation Guide

## Overview
Complete implementation of dynamic card creation system with form submission, state management, and localStorage persistence.

---

## 📁 File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── AddCheckModal.tsx          ← Form component with submission logic
│   │   ├── CheckCard.tsx              ← Reusable card component
│   │   └── StartNewSessionButton.tsx  ← Session reset button
│   ├── contexts/
│   │   ├── CardStatusContext.tsx      ← Manages card status (Pending/Secure)
│   │   └── CustomCardsContext.tsx     ← Manages custom user-created cards
│   ├── utils/
│   │   └── iconMapping.ts             ← Maps iconId strings to components
│   └── pages/
│       └── Dashboard.tsx              ← Main page with card grid
```

---

## 🔄 Complete Data Flow

### 1. User Opens Modal
```tsx
// User clicks "+ Add custom check" button
<button onClick={() => setModalOpen(true)}>
  Add custom check
</button>
```

### 2. User Fills Form
```tsx
// Inside AddCheckModal.tsx
const [triggerName, setTriggerName] = useState("");
const [description, setDescription] = useState("");
const [selectedIcon, setSelectedIcon] = useState("door");
```

### 3. User Submits Form
```tsx
// Inside AddCheckModal.tsx - handleSubmit()
const handleSubmit = () => {
  // Validation
  if (!triggerName.trim()) {
    setErrors({ triggerName: "Please enter a trigger name" });
    return;
  }

  // Transfer data to parent via callback
  onSubmit({
    label: triggerName.trim(),
    description: description.trim(),
    iconId: selectedIcon,
  });

  // Clear form
  setTriggerName("");
  setDescription("");
  setSelectedIcon("door");

  // Close modal
  onClose();
};
```

### 4. Dashboard Receives Data
```tsx
// Inside Dashboard.tsx
function handleAddCard(data: { label: string; description: string; iconId: string }) {
  // Creates card with unique ID and timestamp
  addCustomCard({
    label: data.label,
    description: data.description,
    iconId: data.iconId,
  });
}
```

### 5. Context Creates Card Object
```tsx
// Inside CustomCardsContext.tsx
const addCustomCard = (card: Omit<CustomCard, "id" | "createdAt">) => {
  const newCard: CustomCard = {
    ...card,
    // Generate unique ID
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    // Add timestamp
    createdAt: new Date().toISOString(),
  };

  // Update state
  setCustomCards((prev) => [...prev, newCard]);
  
  return newCard;
};
```

### 6. Auto-Persist to localStorage
```tsx
// Inside CustomCardsContext.tsx - runs on every state change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCards));
  } catch (error) {
    console.error("Failed to save custom cards:", error);
  }
}, [customCards]);
```

### 7. Merge with Default Cards
```tsx
// Inside Dashboard.tsx
const allCards = useMemo(() => {
  const combined = [...CARD_DEFINITIONS];
  
  customCards.forEach((customCard) => {
    combined.push({
      id: customCard.id,
      icon: getIconById(customCard.iconId), // Convert string to component
      label: customCard.label,
    });
  });
  
  return combined;
}, [customCards]);
```

### 8. Render in Grid
```tsx
// Inside Dashboard.tsx
{allCards.map(({ id, icon, label }) => (
  <CheckCard
    key={id}
    id={id}
    icon={icon}
    label={label}
    status={getStatus(id)}
    isActive={active === id}
    onSelect={() => setActive(id)}
  />
))}
```

---

## 💾 localStorage Structure

### Key: `memento_custom_cards`
```json
[
  {
    "id": "custom-1709876543210-x3k9m2p",
    "label": "Bedroom Window",
    "description": "Check if window is locked",
    "iconId": "window",
    "createdAt": "2024-03-08T10:15:43.210Z"
  },
  {
    "id": "custom-1709876789456-a8f2h5n",
    "label": "Garage Door",
    "description": "",
    "iconId": "garage",
    "createdAt": "2024-03-08T10:19:49.456Z"
  }
]
```

### Key: `memento_card_statuses`
```json
{
  "front-door": "Secure",
  "gas-stoves": "Pending",
  "living-windows": "Pending",
  "lights": "Secure",
  "custom-1709876543210-x3k9m2p": "Pending"
}
```

---

## 🎯 Key Features

### ✅ Form State Management
- **triggerName**: Required field, validated on submit
- **description**: Optional field
- **selectedIcon**: Defaults to "door", 8 icon options

### ✅ Unique ID Generation
```tsx
`custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
// Example: "custom-1709876543210-x3k9m2p"
```

### ✅ Automatic Persistence
- Saves to localStorage on every state change
- Loads from localStorage on app mount
- Survives page reloads

### ✅ Card Status Tracking
- Each custom card gets default status "Pending"
- Status managed separately in CardStatusContext
- Persists independently from card definitions

### ✅ Icon Mapping
```tsx
// iconMapping.ts
export const ICON_MAP: Record<string, LucideIcon> = {
  door: DoorOpen,
  flame: Flame,
  window: AppWindow,
  light: Lightbulb,
  outlet: Plug2,
  water: Droplets,
  garage: Car,
  appliance: Zap,
};
```

---

## 🔧 Usage Examples

### Adding a Custom Card Programmatically
```tsx
import { useCustomCards } from "../contexts/CustomCardsContext";

function MyComponent() {
  const { addCustomCard } = useCustomCards();

  const createCard = () => {
    addCustomCard({
      label: "Bedroom Lights",
      description: "Check all bedroom lights are off",
      iconId: "light",
    });
  };
}
```

### Removing a Custom Card
```tsx
const { removeCustomCard } = useCustomCards();

removeCustomCard("custom-1709876543210-x3k9m2p");
```

### Updating a Custom Card
```tsx
const { updateCustomCard } = useCustomCards();

updateCustomCard("custom-1709876543210-x3k9m2p", {
  label: "Updated Label",
  description: "Updated description",
});
```

### Accessing All Custom Cards
```tsx
const { customCards } = useCustomCards();

console.log(customCards);
// Array of CustomCard objects
```

---

## 🧪 Testing the Implementation

### Test 1: Create a New Card
1. Click "+ Add custom check"
2. Enter "Test Card" as trigger name
3. Select "Window" icon
4. Click "Create Trigger"
5. ✅ Card appears in grid immediately
6. ✅ Modal closes automatically
7. ✅ Form is cleared

### Test 2: Verify Persistence
1. Create a custom card
2. Refresh the page
3. ✅ Custom card is still there

### Test 3: Check localStorage
```js
// In browser console
JSON.parse(localStorage.getItem("memento_custom_cards"))
// Should show array of custom cards
```

### Test 4: Update Card Status
1. Click on custom card
2. Hold "Mindful Anchor" button for 3 seconds
3. ✅ Card status changes to "Secure"
4. ✅ Status persists after reload

### Test 5: Session Reset
1. Create custom cards
2. Click "Start a new session"
3. ✅ All custom cards are deleted
4. ✅ All statuses reset to default

---

## 🎨 Customization Guide

### Add More Icon Options
```tsx
// In AddCheckModal.tsx
const MODAL_ICONS = [
  // ... existing icons
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "phone", icon: Phone, label: "Phone" },
];

// In iconMapping.ts
export const ICON_MAP: Record<string, LucideIcon> = {
  // ... existing icons
  camera: Camera,
  phone: Phone,
};
```

### Add More Form Fields
```tsx
// In AddCheckModal.tsx
const [customField, setCustomField] = useState("");

// Add input in JSX
<input
  value={customField}
  onChange={(e) => setCustomField(e.target.value)}
  placeholder="Custom field"
/>

// Update onSubmit
onSubmit({
  label: triggerName.trim(),
  description: description.trim(),
  iconId: selectedIcon,
  customField: customField.trim(), // Add new field
});
```

### Change localStorage Keys
```tsx
// In CustomCardsContext.tsx
const STORAGE_KEY = "my_app_custom_cards"; // Change this

// In StartNewSessionButton.tsx
localStorage.removeItem("my_app_custom_cards"); // Update this too
```

---

## 📊 State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│  ┌────────────────┐  ┌────────────────────────────┐   │
│  │ CardStatus     │  │ CustomCards                │   │
│  │ Context        │  │ Context                    │   │
│  │                │  │                            │   │
│  │ Manages:       │  │ Manages:                   │   │
│  │ - Pending      │  │ - Card definitions         │   │
│  │ - Secure       │  │ - CRUD operations          │   │
│  │                │  │ - localStorage persistence │   │
│  └────────────────┘  └────────────────────────────┘   │
│           ▲                      ▲                      │
│           │                      │                      │
│           └──────────┬───────────┘                      │
│                      │                                  │
│               ┌──────▼──────┐                           │
│               │  Dashboard  │                           │
│               │             │                           │
│               │  Merges:    │                           │
│               │  - Default  │                           │
│               │  - Custom   │                           │
│               └─────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Production Checklist

- ✅ Form validation (required fields)
- ✅ Error handling (try/catch around localStorage)
- ✅ Unique ID generation
- ✅ Automatic persistence
- ✅ State cleanup on modal close
- ✅ Session reset functionality
- ✅ TypeScript types for all data
- ✅ Commented code for maintainability
- ✅ Icon mapping utility
- ✅ Context providers properly nested

---

## 🐛 Troubleshooting

### Cards not persisting after reload
- Check browser console for localStorage errors
- Verify localStorage quota not exceeded
- Check if browser is in private/incognito mode

### Modal not closing after submit
- Verify `onClose()` is called in `handleSubmit`
- Check for JavaScript errors in console

### Icons not displaying
- Verify iconId matches ICON_MAP keys
- Check that icon is imported in iconMapping.ts
- Fallback to DoorOpen if iconId not found

### Duplicate cards appearing
- Check if useEffect dependencies are correct
- Verify no duplicate Provider wrappers in App.tsx
- Clear localStorage and test fresh

---

## 📝 Summary

This implementation provides a complete, production-ready system for:
1. ✅ **Form submission** with validation
2. ✅ **Dynamic card creation** with unique IDs
3. ✅ **State management** via React Context
4. ✅ **localStorage persistence** with auto-save
5. ✅ **Modal auto-close** and form clearing
6. ✅ **Icon mapping** from strings to components
7. ✅ **Status tracking** separate from definitions
8. ✅ **Session reset** to clear all data

All code is TypeScript, fully typed, and production-ready with error handling and clear documentation.
