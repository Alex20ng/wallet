import { Platform, type ViewStyle } from "react-native";
import { useColorScheme } from "../hooks/use-color-scheme";

// Convertit une couleur hexadécimale (+ opacité) en `rgba()` pour `boxShadow`.
function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith("#") || alpha >= 1) return color;
  const hex = color.slice(1);
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Ombre multiplateforme. Sur le web, les props `shadow*` sont dépréciées :
 * on utilise `boxShadow`. Sur natif, on garde `shadow*` + `elevation`.
 */
export function shadow(
  color: string,
  options: {
    x?: number;
    y?: number;
    blur?: number;
    opacity?: number;
    elevation?: number;
  } = {},
): ViewStyle {
  const { x = 0, y = 0, blur = 0, opacity = 1, elevation = 0 } = options;
  return Platform.select({
    web: {
      boxShadow:
        color === "transparent" || opacity === 0
          ? "none"
          : `${x}px ${y}px ${blur}px ${withAlpha(color, opacity)}`,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: x, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
      elevation,
    },
  }) as ViewStyle;
}

export const lightColors = {
  // Primary — Emerald
  primary: "#10B981",
  primaryLight: "#ECFDF5",
  primaryDark: "#059669",

  // Accent — Cyan / Sky
  accent: "#38BDF8",
  accentLight: "#F0F9FF",

  // Semantic
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  error: "#F43F5E",
  errorLight: "#FFF1F2",

  // Background — Slate
  background: "#F8FAFC",
  backgroundSecondary: "#F1F5F9",
  backgroundTertiary: "#E2E8F0",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  textLink: "#0EA5E9",

  // Border
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  borderFocus: "#10B981",

  // Overlay
  overlay: "rgba(15, 23, 42, 0.55)",
  overlayLight: "rgba(15, 23, 42, 0.35)",

  // Charts
  chartColors: [
    "#10B981",
    "#38BDF8",
    "#059669",
    "#0EA5E9",
    "#14B8A6",
    "#F59E0B",
    "#F43F5E",
    "#0EA5E9",
    "#3B82F6",
    "#34D399",
  ],
};

export const darkColors = {
  // Primary — Emerald
  primary: "#34D399",
  primaryLight: "#0D2B22",
  primaryDark: "#10B981",

  // Accent — Cyan / Sky
  accent: "#38BDF8",
  accentLight: "#0B2436",

  // Semantic
  success: "#34D399",
  successLight: "#0D2B22",
  warning: "#FBBF24",
  warningLight: "#2C2109",
  error: "#FB7185",
  errorLight: "#2E1520",

  // Background — deep Slate, never pure black
  background: "#0F172A",
  backgroundSecondary: "#131C31",
  backgroundTertiary: "#1A2438",
  surface: "#1E293B",
  surfaceElevated: "#243247",

  // Text
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textInverse: "#0F172A",
  textLink: "#38BDF8",

  // Border — white/10 style
  border: "rgba(255, 255, 255, 0.10)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  borderFocus: "#34D399",

  // Overlay
  overlay: "rgba(2, 6, 23, 0.72)",
  overlayLight: "rgba(2, 6, 23, 0.5)",

  // Charts
  chartColors: [
    "#34D399",
    "#38BDF8",
    "#10B981",
    "#7DD3FC",
    "#2DD4BF",
    "#FBBF24",
    "#FB7185",
    "#7DD3FC",
    "#60A5FA",
    "#6EE7B7",
  ],
};

export type Colors = typeof lightColors;

export function useColors(): Colors {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? darkColors : lightColors;
}

export const gradients = {
  brand: ["#10B981", "#38BDF8"] as const,
  brandDeep: ["#059669", "#10B981", "#38BDF8"] as const,
  brandDark: ["#059669", "#0EA5E9"] as const,
  success: ["#10B981", "#34D399"] as const,
  danger: ["#F43F5E", "#FB7185"] as const,
  warning: ["#F59E0B", "#FBBF24"] as const,
  sunset: ["#F59E0B", "#F43F5E"] as const,
  ocean: ["#0EA5E9", "#10B981"] as const,
};

export type GradientName = keyof typeof gradients;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

export const shadows = {
  none: shadow("transparent", {
    x: 0,
    y: 0,
    blur: 0,
    opacity: 0,
    elevation: 0,
  }),
  xs: shadow("#059669", { y: 1, blur: 3, opacity: 0.08, elevation: 1 }),
  sm: shadow("#0F172A", { y: 2, blur: 6, opacity: 0.06, elevation: 2 }),
  md: shadow("#0F172A", { y: 6, blur: 14, opacity: 0.08, elevation: 5 }),
  lg: shadow("#0F172A", { y: 12, blur: 24, opacity: 0.12, elevation: 10 }),
  xl: shadow("#10B981", { y: 16, blur: 28, opacity: 0.32, elevation: 14 }),
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    easeIn: "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
    easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;
