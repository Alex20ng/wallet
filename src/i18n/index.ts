import { useCallback, useMemo } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  translations,
  LANGUAGE_LOCALES,
  type Language,
  type TranslationKey,
} from "./translations";

export type { Language, TranslationKey };
export { LANGUAGE_LOCALES };

export type TranslationParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

/** Traduit une clé avec la langue courante (utilisable hors React). */
export function translate(
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const language = useSettingsStore.getState().language;
  const template = translations[language]?.[key] ?? translations.fr[key] ?? key;
  return interpolate(template, params);
}

/**
 * Choisit la variante singulier/pluriel d'une clé à suffixe `One`/`Other`
 * selon la langue courante. `baseKey` est la clé sans suffixe.
 */
export function translatePlural(
  baseKey: "transactions.count" | "categories.count",
  count: number,
  params?: TranslationParams,
): string {
  const language = useSettingsStore.getState().language;
  const plural = language === "fr" ? count > 1 : count !== 1;
  const key = `${baseKey}${plural ? "Other" : "One"}` as TranslationKey;
  return translate(key, { count, ...params });
}

export function getCurrentLocale(): string {
  const language = useSettingsStore.getState().language;
  return LANGUAGE_LOCALES[language];
}

export interface Translator {
  t: (key: TranslationKey, params?: TranslationParams) => string;
  tp: (
    baseKey: "transactions.count" | "categories.count",
    count: number,
    params?: TranslationParams,
  ) => string;
  language: Language;
  locale: string;
}

/**
 * Hook de traduction : se réabonne à la langue et à la devise pour forcer le
 * re-render des composants lorsque l'utilisateur change ces préférences.
 */
export function useTranslation(): Translator {
  const language = useSettingsStore((state) => state.language);
  useSettingsStore((state) => state.currencyCode);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      interpolate(
        translations[language]?.[key] ?? translations.fr[key] ?? key,
        params,
      ),
    [language],
  );

  const tp = useCallback(
    (
      baseKey: "transactions.count" | "categories.count",
      count: number,
      params?: TranslationParams,
    ) => {
      const plural = language === "fr" ? count > 1 : count !== 1;
      const key = `${baseKey}${plural ? "Other" : "One"}` as TranslationKey;
      return interpolate(
        translations[language]?.[key] ?? translations.fr[key] ?? key,
        { count, ...params },
      );
    },
    [language],
  );

  return useMemo(
    () => ({ t, tp, language, locale: LANGUAGE_LOCALES[language] }),
    [t, tp, language],
  );
}
