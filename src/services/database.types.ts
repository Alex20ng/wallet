// Interface commune de la couche données, partagée entre natif (SQLite) et web (Dexie).
// Le natif expose `SQLite.SQLiteDatabase` (structuralement compatible), le web expose
// une façade en mémoire qui implémente `WalletDatabase`.

export type SQLiteBindValue = string | number | boolean | null | Uint8Array;

export type SQLiteBindParams =
  | SQLiteBindValue[]
  | Record<string, SQLiteBindValue>
  | SQLiteBindValue;

export interface SQLiteRunResult {
  changes: number;
  lastInsertRowId: number | bigint;
}

/** Sous-ensemble des méthodes SQLite réellement utilisées par les repositories. */
export interface WalletDatabase {
  execSync(source: string): void;
  getAllSync<T = Record<string, unknown>>(
    source: string,
    params?: SQLiteBindParams,
  ): T[];
  getFirstSync<T = Record<string, unknown>>(
    source: string,
    params?: SQLiteBindParams,
  ): T | null;
  runSync(source: string, params?: SQLiteBindParams): SQLiteRunResult;
  closeSync(): void;
}

export interface DatabaseHandle {
  getDatabase(): WalletDatabase;
  closeDatabase(): void;
  /** Retourne une promesse sur web (chargement IndexedDB), void sur natif. */
  runMigrations(): Promise<void> | void;
}
