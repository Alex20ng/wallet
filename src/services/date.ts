import { useCallback } from 'react';
import type { PeriodPreset } from '../types';
import { getCurrentLocale, translate } from '../i18n';
import { useSettingsStore } from '../store/useSettingsStore';

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date = new Date()): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth();
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return translate("date.today");
  if (diffDays === 1) return translate("date.yesterday");
  if (diffDays < 7) return translate("date.daysAgo", { count: diffDays });
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) {
    return translate(weeks === 1 ? "date.weekAgo" : "date.weeksAgo", {
      count: weeks,
    });
  }
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return translate("date.monthsAgo", { count: months });
  const years = Math.floor(diffDays / 365);
  return translate(years === 1 ? "date.yearAgo" : "date.yearsAgo", {
    count: years,
  });
}

export function getPeriodPresets(): { value: PeriodPreset; label: string }[] {
  return [
    { value: 'today', label: translate("period.today") },
    { value: 'week', label: translate("period.week") },
    { value: 'month', label: translate("period.month") },
    { value: 'year', label: translate("period.year") },
    { value: 'custom', label: translate("period.custom") },
  ];
}

export function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat(getCurrentLocale(), { month: 'long', year: 'numeric' }).format(date),
    });
  }
  return options;
}

/**
 * Variantes réactives (hooks) des helpers ci-dessus. Leur identité change avec
 * la langue, ce qui force React Compiler à recalculer les valeurs mémoïsées
 * (ces fonctions lisent le store implicitement, dépendance invisible pour lui).
 */
export function usePeriodPresets() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    () => getPeriodPresets(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dépendance volontaire : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

export function useMonthOptions() {
  const language = useSettingsStore((state) => state.language);
  return useCallback(
    () => getMonthOptions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dépendance volontaire : invalide la mémoïsation à chaque changement de langue
    [language],
  );
}

export function parseDateInput(input: string): Date | null {
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    if (format.test(input)) {
      const parts = input.split(/[-/]/);
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }
  return null;
}