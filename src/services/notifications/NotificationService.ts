// Point d'entrée partagé du service de notifications.
// Sur natif : `NotificationService.native.ts` (expo-notifications).
// Sur web : `NotificationService.web.ts` (no-op — pas de push local sur PWA).
export * from "./NotificationService.native";
