// Transfert de fichiers texte — implémentation native (iOS / Android).
// Sauvegarde via expo-file-system puis partage système (expo-sharing) ; sélection
// via expo-document-picker. Ces modules natifs ne doivent jamais être importés
// par le web : Metro résout `file-transfer.web.ts` à la place.

import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export interface PickedFile {
  name: string;
  content: string;
  mimeType: string | null;
}

export async function saveTextFile(
  content: string,
  filename: string,
  mimeType: string,
): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(content);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType,
      dialogTitle: filename,
    });
  }
}

export async function pickTextFile(
  mimeTypes: string[],
): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes.length === 1 ? mimeTypes[0] : mimeTypes,
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const file = new File(asset.uri);
  const content = await file.text();
  return {
    name: asset.name,
    content,
    mimeType: asset.mimeType ?? null,
  };
}
