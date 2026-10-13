import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "theme-preference";

export type ThemePreference = "light" | "dark";

let preference: ThemePreference | null = null;
const listeners = new Set<() => void>();

export function getThemePreference(): ThemePreference | null {
  return preference;
}

export function subscribeThemePreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function systemPreference(): ThemePreference {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyToDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.style.colorScheme = preference ?? systemPreference();
}

function notify() {
  applyToDocument();
  listeners.forEach((listener) => listener());
}

export async function loadThemePreference() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      preference = saved;
    }
  } catch {
    // Pas de préférence lisible : on garde le thème du système
  }
  notify();
}

export async function setThemePreference(next: ThemePreference) {
  preference = next;
  notify();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Le thème est appliqué même si la sauvegarde échoue
  }
}
