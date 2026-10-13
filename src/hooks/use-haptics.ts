// Point d'entrée partagé du module haptics.
// Sur natif : `use-haptics.native.ts` (expo-haptics).
// Sur web : `use-haptics.web.ts` (no-op — pas de retour haptique sur PWA).
export * from "./use-haptics.native";