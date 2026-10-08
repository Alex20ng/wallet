import type { PeriodPreset, PeriodRange, TransactionType } from "../types";

export const CURRENCY_LOCALE = "fr-FR";
export const CURRENCY_CODE = "XAF";

export function formatCurrency(
  amountCents: number,
  options?: { showSign?: boolean; compact?: boolean },
): string {
  const amount = Math.round(amountCents / 100);

  const formatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: options?.compact ? "compact" : "standard",
  });

  let formatted = formatter.format(amount);

  if (options?.showSign && amount > 0) {
    formatted = `+${formatted}`;
  }

  return `${formatted} ${CURRENCY_CODE}`;
}

export function parseCurrency(input: string): number {
  const normalized = input.replace(',', '.');
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
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatMonth(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    month: "long",
    year: "numeric",
  }).format(d);
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
        label: "Période personnalisée",
      };
  }

  return {
    start: start.getTime(),
    end: end.getTime(),
    label: getPeriodLabel(preset),
  };
}

function getPeriodLabel(preset: PeriodPreset): string {
  switch (preset) {
    case "today":
      return "Aujourd'hui";
    case "week":
      return "Cette semaine";
    case "month":
      return "Ce mois";
    case "year":
      return "Cette année";
    default:
      return "Période";
  }
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
  return type === "income" ? "Revenu" : "Dépense";
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
  export { getPeriodPresets } from "./date";

