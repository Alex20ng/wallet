import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

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

function notify() {
  listeners.forEach((listener) => listener());
}

/** À appeler une fois au démarrage de l'app. */
export async function loadThemePreference() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      preference = saved;
      Appearance.setColorScheme(saved);
    }
  } catch {
    // Pas de préférence lisible : on garde le thème du système
  }
  notify();
}

export async function setThemePreference(next: ThemePreference) {
  preference = next;
  Appearance.setColorScheme(next);
  notify();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Le thème est appliqué même si la sauvegarde échoue
  }
}
