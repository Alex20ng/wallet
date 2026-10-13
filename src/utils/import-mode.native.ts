// Choix du mode d'import — implémentation native.
// Boîte de dialogue à 3 boutons (Annuler / Fusionner / Remplacer).

import { Alert } from "react-native";
import type { ImportMode } from "../services/backup";

export interface ImportModeOptions {
  title: string;
  message: string;
  cancelLabel: string;
  mergeLabel: string;
  replaceLabel: string;
  mergeConfirmMessage: string;
  replaceConfirmMessage: string;
}

export function chooseImportMode(
  options: ImportModeOptions,
): Promise<ImportMode | null> {
  return new Promise((resolve) => {
    Alert.alert(
      options.title,
      options.message,
      [
        {
          text: options.cancelLabel,
          style: "cancel",
          onPress: () => resolve(null),
        },
        { text: options.mergeLabel, onPress: () => resolve("merge") },
        {
          text: options.replaceLabel,
          style: "destructive",
          onPress: () => resolve("replace"),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
