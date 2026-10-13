// Transfert de fichiers texte — implémentation web (PWA).
// Téléchargement via un Blob + ancre, sélection via un <input type="file">.

import type { PickedFile } from "./file-transfer.native";

export type { PickedFile };

const isBrowser = typeof window !== "undefined";

export async function saveTextFile(
  content: string,
  filename: string,
  mimeType: string,
): Promise<void> {
  if (!isBrowser) return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function pickTextFile(
  mimeTypes: string[],
): Promise<PickedFile | null> {
  if (!isBrowser) return null;

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (mimeTypes.length > 0) {
      input.accept = mimeTypes.join(",");
    }
    input.style.display = "none";

    let settled = false;
    const finish = (value: PickedFile | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(value);
    };

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      try {
        const content = await file.text();
        finish({ name: file.name, content, mimeType: file.type || null });
      } catch {
        finish(null);
      }
    });
    input.addEventListener("cancel", () => finish(null));

    document.body.appendChild(input);
    input.click();
  });
}
