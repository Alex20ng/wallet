// Choix du mode d'import — implémentation web.
// `window.confirm` ne supportant que 2 boutons, on enchaîne deux confirmations :
// fusionner d'abord, puis remplacer ; annuler les deux abandonne l'import.

import type { ImportMode } from "../services/backup";
import type { ImportModeOptions } from "./import-mode.native";

export type { ImportModeOptions };

const isBrowser = typeof window !== "undefined";

export async function chooseImportMode(
  options: ImportModeOptions,
): Promise<ImportMode | null> {
  if (!isBrowser) return null;

  const merge = window.confirm(
    `${options.title}\n\n${options.message}\n${options.mergeConfirmMessage}`,
  );
  if (merge) return "merge";

  const replace = window.confirm(
    `${options.title}\n\n${options.replaceConfirmMessage}`,
  );
  if (replace) return "replace";

  return null;
}
