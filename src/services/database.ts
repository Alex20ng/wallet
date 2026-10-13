// Point d'entrée partagé de la couche données.
// Sur natif, `database.native.ts` (expo-sqlite) est utilisé ;
// sur web, Metro résout `database.web.ts` (façade Dexie en mémoire).
export * from "./database.native";
