import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

const STORAGE_KEY = "theme-preference";

export type ThemePreference = "light" | "dark";

/** À appeler une fois au démarrage de l'app. */
export async function loadThemePreference() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      Appearance.setColorScheme(saved);
    }
  } catch {
    // Pas de préférence lisible : on garde le thème du système
  }
}

export async function setThemePreference(preference: ThemePreference) {
  Appearance.setColorScheme(preference);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Le thème est appliqué même si la sauvegarde échoue
  }
}
