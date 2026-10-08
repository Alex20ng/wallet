import * as SQLite from "expo-sqlite";
import { migrations } from "./migrations";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("wallet.db");
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.closeSync();
    dbInstance = null;
  }
}

export function executeMigration(sql: string): void {
  const db = getDatabase();
  db.execSync(sql);
}

export function runMigrations(): void {
  const db = getDatabase();

  const result = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version;",
  );

  const currentVersion = result?.user_version ?? 0;

  const migrationVersions = Object.keys(migrations)
    .map(Number)
    .sort((a, b) => a - b);

  const pendingMigrations = migrationVersions.filter(
    (version) => version > currentVersion,
  );

  if (pendingMigrations.length === 0) {
    return;
  }

  db.withTransactionSync(() => {
    for (const version of pendingMigrations) {
      const migration = migrations[version as keyof typeof migrations];

      if (!migration) {
        throw new Error(`Migration ${version} introuvable.`);
      }

      db.execSync(migration);

      db.execSync(`PRAGMA user_version = ${version};`);
    }
  });
}
