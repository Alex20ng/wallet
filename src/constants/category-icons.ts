import {
  Banknote,
  Bone,
  BookOpen,
  Car,
  Dumbbell,
  Ellipsis,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  Heart,
  House,
  Laptop,
  Music,
  Receipt,
  Shirt,
  ShoppingBag,
  Tag,
  TrendingUp,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react-native";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  restaurant: Utensils,
  car: Car,
  bag: ShoppingBag,
  "game-controller": Gamepad2,
  receipt: Receipt,
  heart: Heart,
  book: BookOpen,
  "more-horizontal": Ellipsis,
  cash: Banknote,
  laptop: Laptop,
  "trending-up": TrendingUp,
  gift: Gift,
  home: House,
  shirt: Shirt,
  wifi: Wifi,
  fuel: Fuel,
  paw: Bone,
  film: Film,
  music: Music,
  dumbbell: Dumbbell,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICON_MAP);

export function getCategoryIcon(name?: string): LucideIcon {
  if (name && CATEGORY_ICON_MAP[name]) {
    return CATEGORY_ICON_MAP[name];
  }
  return Tag;
}

export const CATEGORY_COLORS = Array.from(
  new Set([
    "#10B981",
    "#38BDF8",
    "#059669",
    "#0EA5E9",
    "#14B8A6",
    "#F43F5E",
    "#F59E0B",
    "#34D399",
    "#3B82F6",
    "#22D3EE",
    "#6EE7B7",
    "#0284C7",
    "#F97316",
    "#7DD3FC",
    "#FB7185",
  ]),
);
