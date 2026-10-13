import { Alert } from "react-native";

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export type AlertOptions = {
  cancelable?: boolean;
};

export function alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
): void {
  Alert.alert(title, message, buttons, options);
}