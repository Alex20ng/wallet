// Alertes système sur le web : React Native Web ne supporte pas `Alert.alert`.
// Les motifs utilisés par l'app sont des confirmations (2 boutons)
// ou de simples messages (0-1 bouton).

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export type AlertOptions = {
  cancelable?: boolean;
};

const isBrowser = typeof window !== "undefined";

export function alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  _options?: AlertOptions,
): void {
  if (!isBrowser) return;
  const full = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(full);
    return;
  }
  if (buttons.length === 1) {
    window.alert(full);
    buttons[0].onPress?.();
    return;
  }
  // Motif courant : [« Annuler », { onPress }] → confirmation native.
  const ok = window.confirm(full);
  if (ok) {
    const target = buttons[1];
    target.onPress?.();
  }
  // Plus de 2 boutons : non géré génériquement (sélecteurs d'heure passent par pick-time).
}
