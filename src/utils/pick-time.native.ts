import { Alert } from "react-native";

export interface PickTimeOptions {
  title: string;
  message: string;
  cancelLabel: string;
  currentHour: number;
  onPick: (hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function pickTime(options: PickTimeOptions): void {
  const buttons = HOURS.map((hour) => ({
    text: formatTime(hour, 0),
    onPress: () => options.onPick(hour),
  }));
  Alert.alert(options.title, options.message, [
    { text: options.cancelLabel, style: "cancel" },
    ...buttons,
  ]);
}