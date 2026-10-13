import { useSyncExternalStore } from "react";
import {
  getThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "./theme-preference";

function systemScheme(): ThemePreference {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function useColorScheme(): ThemePreference {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getThemePreference,
    () => null,
  );
  return preference ?? systemScheme();
}
