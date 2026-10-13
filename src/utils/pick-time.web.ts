import type { PickTimeOptions } from "./pick-time.native";

const isBrowser = typeof window !== "undefined";

export function pickTime(options: PickTimeOptions): void {
  if (!isBrowser) return;
  const raw = window.prompt(
    `${options.title}\n\n${options.message}\n\nHeure (0-23) :`,
    String(options.currentHour),
  );
  if (raw === null || raw.trim() === "") return;
  const hour = parseInt(raw.trim(), 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return;
  options.onPick(hour);
}