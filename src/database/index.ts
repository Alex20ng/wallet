import * as SQLite from "expo-sqlite";
import { migrations } from "./migrations";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const DATABASE_NAME = "wallet.db";

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
  }

  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.closeSync();
    dbInstance = null;
  }
}

function getDatabaseVersion(db: SQLite.SQLiteDatabase): number {
  const result = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version;",
  );

  return result?.user_version ?? 0;
}

function setDatabaseVersion(db: SQLite.SQLiteDatabase, version: number): void {
  db.execSync(`PRAGMA user_version = ${version};`);
}

export function runMigrations(): void {
  const db = getDatabase();

  const currentVersion = getDatabaseVersion(db);

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

      setDatabaseVersion(db, version);
    }
  });
}
