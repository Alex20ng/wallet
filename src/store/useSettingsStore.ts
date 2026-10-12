import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "../i18n/translations";
import { DEFAULT_CURRENCY_CODE } from "../constants/currencies";

interface SettingsState {
  language: Language;
  currencyCode: string;
  setLanguage: (language: Language) => void;
  setCurrency: (currencyCode: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "fr",
      currencyCode: DEFAULT_CURRENCY_CODE,
      setLanguage: (language) => set({ language }),
      setCurrency: (currencyCode) => set({ currencyCode }),
    }),
    {
      name: "wallet-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
