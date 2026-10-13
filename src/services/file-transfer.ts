// Point d'entrée partagé du transfert de fichiers texte.
// Natif : `file-transfer.native.ts` (expo-file-system / sharing / document-picker).
// Web : `file-transfer.web.ts` (Blob + téléchargement / <input type="file">).
export * from "./file-transfer.native";
