import {
  DoorOpen,
  Flame,
  AppWindow,
  Lightbulb,
  Plug,
  Droplets,
  Car,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon Mapping Utility
 * Maps icon IDs (strings) to Lucide icon components
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  door: DoorOpen,
  flame: Flame,
  window: AppWindow,
  light: Lightbulb,
  outlet: Plug,
  water: Droplets,
  garage: Car,
  appliance: Zap,
};

/**
 * Get icon component by ID
 * Returns DoorOpen as fallback if ID not found
 */
export function getIconById(iconId: string): LucideIcon {
  return ICON_MAP[iconId] || DoorOpen;
}
