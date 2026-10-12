import { useCallback } from "react";
import { getCurrency } from "../constants/currencies";
import { getCurrentLocale, translate } from "../i18n";
import type { TranslationKey } from "../i18n/translations";
import { useSettingsStore } from "../store/useSettingsStore";
import type { PeriodPreset, PeriodRange, TransactionType } from "../types";

export interface FormatCurrencyOptions {
  showSign?: boolean;
  compact?: boolean;
  hideSymbol?: boolean;
}

export function formatCurrency(
  amountCents: number,
  options?: FormatCurrencyOptions,
): string {
  const { currencyCode } = useSettingsStore.getState();
  const currency = getCurrency(currencyCode);
  const locale = getCurrentLocale();
  const amount = amountCents / 100;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    notation: options?.compact ? "compact" : "standard",
    useGrouping: true,
  });

  let formatted = formatter.format(amount);

  // Remplacer les séparateurs de milliers par des espaces
  formatted = formatted.replace(/[,٬٫.](?=\d{3}(?:\D|$))/g, " ");

  if (options?.showSign && amount > 0) {
    formatted = `+${formatted}`;
  }

  if (options?.hideSymbol) {
    return formatted;
  }

  return `${formatted} ${currency.symbol}`;
}

export function parseCurrency(input: string): number {
  const normalized = input.replace(",", ".");
  const match = normalized.match(/[-]?(\d+(?:\.\d{0,2})?)/);
  if (!match) return 0;

  const value = parseFloat(match[0]);
  if (Number.isNaN(value)) return 0;

  return Math.round(value * 100);
}

export function formatDate(
  date: Date | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(getCurrentLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatMonth(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(getCurrentLocale(), {
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Formateurs liés aux préférences (langue + devise) sous forme de hooks.
 *
 * Indispensable avec React Compiler : il mémoïse les appels à `formatCurrency`
 * en se basant uniquement sur leurs arguments visibles et ignore la lecture
 * implicite du store. En passant par ces hooks, l'identité de la fonction change
 * quand la langue ou la devise change, ce qui invalide le cache de mémoïsation
 * et met bien à jour les montants/dates affichés.
 */
export function useFormatCurrency() {
  const currencyCode = useSettingsStore((state) => state.currencyCode);
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    (amountCents: number, options?: FormatCurrencyOptions) =>
      formatCurrency(amountCents, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dépendances volontaires : forcent React Compiler à recalculer les montants formatés
    [currencyCode, language],
  );
}

export function useFormatDate() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idem : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

export function useFormatMonth() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    (date: Date | number) => formatMonth(date),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idem : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

const PERIOD_LABEL_KEYS: Record<PeriodPreset, TranslationKey> = {
  today: "period.today",
  week: "period.week",
  month: "period.month",
  year: "period.year",
  custom: "period.custom",
};

const PERIOD_SHORT_LABEL_KEYS: Record<PeriodPreset, TranslationKey> = {
  today: "period.todayShort",
  week: "period.weekShort",
  month: "period.monthShort",
  year: "period.yearShort",
  custom: "period.customShort",
};

export function getPeriodLabel(preset: PeriodPreset): string {
  return translate(PERIOD_LABEL_KEYS[preset] ?? "period.month");
}

export function getPeriodShortLabel(preset: PeriodPreset): string {
  return translate(PERIOD_SHORT_LABEL_KEYS[preset] ?? "period.monthShort");
}

export function usePeriodLabel() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    (preset: PeriodPreset) => getPeriodLabel(preset),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idem : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

export function usePeriodShortLabel() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    (preset: PeriodPreset) => getPeriodShortLabel(preset),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idem : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

export function getPeriodRange(
  preset: PeriodPreset,
  customStart?: number,
  customEnd?: number,
): PeriodRange {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (preset) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      return {
        start: customStart || now.getTime(),
        end: customEnd || now.getTime(),
        label: translate("period.customLabel"),
      };
  }

  return {
    start: start.getTime(),
    end: end.getTime(),
    label: getPeriodLabel(preset),
  };
}

export function getMonthRange(year: number, month: number): PeriodRange {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return {
    start: start.getTime(),
    end: end.getTime(),
    label: formatMonth(start),
  };
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return translate(type === "income" ? "common.income" : "common.expense");
}

export function getTransactionTypeColor(type: TransactionType): string {
  return type === "income" ? "#10B981" : "#F43F5E";
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function generateColor(): string {
  const colors = [
    "#10B981",
    "#38BDF8",
    "#059669",
    "#0EA5E9",
    "#14B8A6",
    "#F59E0B",
    "#F43F5E",
    "#34D399",
    "#3B82F6",
    "#22D3EE",
    "#6EE7B7",
    "#0EA5E9",
    "#F97316",
    "#7DD3FC",
    "#FB7185",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Re-export types for convenience
export type { PeriodPreset, PeriodRange, TransactionType };

// Re-export getPeriodPresets from date
  export { getPeriodPresets, useMonthOptions, usePeriodPresets } from "./date";

