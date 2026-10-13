// Façade web (PWA) de la couche données.
// SQLite (expo-sqlite) étant natif, le web réplique en mémoire le schéma et le
// dialecte utilisé par `src/repositories` via `sqlite-web.ts`, avec persistance
// IndexedDB gérée par Dexie. Le pan de `database.native.ts` reste inchangé.
//
// Les mutations sont appliquées en mémoire (lectures synchrones identiques au
// natif) puis persistées asynchronement dans IndexedDB, dans l'ordre.

import { Dexie, type Table } from "dexie";

import type {
  SQLiteBindParams,
  SQLiteRunResult,
  WalletDatabase,
} from "./database.types";
import type { SqlRow, SqlTables } from "./sqlite-web";
import { executeStatement } from "./sqlite-web";

type DexieTableKey = "categories" | "transactions" | "budgets";

class WalletDexie extends Dexie {
  categories!: Table<SqlRow, string>;
  transactions!: Table<SqlRow, string>;
  budgets!: Table<SqlRow, string>;

  constructor() {
    super("wallet");
    this.version(1).stores({
      categories: "id, type",
      transactions: "id, date, type",
      budgets: "id, category_id, period_start",
    });
  }
}

// Catégories par défaut : répliquées du SQL de `migrations/001_initial.ts`.
const DEFAULT_CATEGORIES: {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  sort_order: number;
}[] = [
  {
    id: "cat_food",
    name: "Food & Dining",
    icon: "restaurant",
    color: "#FF6B6B",
    type: "expense",
    sort_order: 1,
  },
  {
    id: "cat_transport",
    name: "Transportation",
    icon: "car",
    color: "#4ECDC4",
    type: "expense",
    sort_order: 2,
  },
  {
    id: "cat_shopping",
    name: "Shopping",
    icon: "bag",
    color: "#45B7D1",
    type: "expense",
    sort_order: 3,
  },
  {
    id: "cat_entertainment",
    name: "Entertainment",
    icon: "game-controller",
    color: "#96CEB4",
    type: "expense",
    sort_order: 4,
  },
  {
    id: "cat_bills",
    name: "Bills & Utilities",
    icon: "receipt",
    color: "#FFEAA7",
    type: "expense",
    sort_order: 5,
  },
  {
    id: "cat_health",
    name: "Healthcare",
    icon: "heart",
    color: "#DDA0DD",
    type: "expense",
    sort_order: 6,
  },
  {
    id: "cat_education",
    name: "Education",
    icon: "book",
    color: "#98D8C8",
    type: "expense",
    sort_order: 7,
  },
  {
    id: "cat_other_expense",
    name: "Other",
    icon: "more-horizontal",
    color: "#B8B8B8",
    type: "expense",
    sort_order: 8,
  },
  {
    id: "cat_salary",
    name: "Salary",
    icon: "cash",
    color: "#00C851",
    type: "income",
    sort_order: 1,
  },
  {
    id: "cat_freelance",
    name: "Freelance",
    icon: "laptop",
    color: "#2BBBAD",
    type: "income",
    sort_order: 2,
  },
  {
    id: "cat_investments",
    name: "Investments",
    icon: "trending-up",
    color: "#33B5E5",
    type: "income",
    sort_order: 3,
  },
  {
    id: "cat_gifts",
    name: "Gifts",
    icon: "gift",
    color: "#AA66CC",
    type: "income",
    sort_order: 4,
  },
  {
    id: "cat_other_income",
    name: "Other",
    icon: "more-horizontal",
    color: "#B8B8B8",
    type: "income",
    sort_order: 5,
  },
];

const isBrowser = typeof window !== "undefined";

class WebWalletDB implements WalletDatabase {
  private dexie: WalletDexie | null = null;
  private readyPromise: Promise<void> | null = null;
  private tables: SqlTables = { categories: [], transactions: [], budgets: [] };
  private writeQueue: Promise<void> = Promise.resolve();

  /** Initialise la base (IndexedDB) puis charge tout en mémoire. Idempotente. */
  ready(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.initialize();
    }
    return this.readyPromise;
  }

  private async initialize(): Promise<void> {
    const dexie = new WalletDexie();
    await dexie.open();
    const [categories, transactions, budgets] = await Promise.all([
      dexie.categories.toArray(),
      dexie.transactions.toArray(),
      dexie.budgets.toArray(),
    ]);
    this.tables.categories = categories;
    this.tables.transactions = transactions;
    this.tables.budgets = budgets;
    if (this.tables.categories.length === 0) {
      await this.seedCategories(dexie);
    }
    this.dexie = dexie;
    if (isBrowser) {
      // Demande aimable de persistance (indispensable pour l'usage hors ligne)
      navigator.storage?.persist?.().catch(() => {});
    }
  }

  private async seedCategories(dexie: WalletDexie): Promise<void> {
    const now = Date.now();
    const rows: SqlRow[] = DEFAULT_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      is_default: 1,
      sort_order: c.sort_order,
      created_at: now,
      updated_at: now,
    }));
    this.tables.categories = rows;
    await dexie.categories.bulkPut(rows as never);
  }

  private assertReady(): void {
    if (!this.dexie) {
      throw new Error("Base web non initialisée : appelez runMigrations()");
    }
  }

  private normalizeParams(params?: SQLiteBindParams): SqlRow[keyof SqlRow][] {
    if (params === undefined || params === null) return [];
    if (Array.isArray(params)) return [...params];
    if (typeof params === "object") return Object.values(params);
    return [params];
  }

  private enqueueWrite(tableName: DexieTableKey): void {
    const dex = this.dexie;
    if (!dex) return;
    const table = dex[tableName] as Table<SqlRow, string>;
    if (!table) return;
    const snapshot = [...(this.tables[tableName] ?? [])];
    this.writeQueue = this.writeQueue
      .then(() =>
        dex.transaction("rw", table, async () => {
          await table.clear();
          await table.bulkPut(snapshot as never[]);
        }),
      )
      .then(() => undefined)
      .catch((err) => console.error("[WebWalletDB]", err));
  }

  private applyWrite(
    result: ReturnType<typeof executeStatement>,
  ): SQLiteRunResult {
    if (result.kind === "void") return { changes: 0, lastInsertRowId: 0 };
    if (result.kind === "insert") {
      this.tables[result.table as DexieTableKey] = [
        ...(this.tables[result.table as DexieTableKey] ?? []),
        ...result.rows,
      ];
      this.enqueueWrite(result.table as DexieTableKey);
      return { changes: result.rows.length, lastInsertRowId: 0 };
    }
    if (result.kind === "update") {
      const table = this.tables[result.table as DexieTableKey] ?? [];
      const byId = new Map(table.map((row) => [row.id, row]));
      for (const u of result.rows) {
        if (u.id !== null && u.id !== undefined) byId.set(u.id, u);
      }
      this.tables[result.table as DexieTableKey] = Array.from(byId.values());
      this.enqueueWrite(result.table as DexieTableKey);
      return { changes: result.rows.length, lastInsertRowId: 0 };
    }
    if (result.kind === "delete") {
      const idSet = new Set(result.ids);
      const prevLen = (this.tables[result.table as DexieTableKey] ?? []).length;
      this.tables[result.table as DexieTableKey] = (
        this.tables[result.table as DexieTableKey] ?? []
      ).filter((row) => !idSet.has(row.id as string));
      this.enqueueWrite(result.table as DexieTableKey);
      return {
        changes:
          prevLen - (this.tables[result.table as DexieTableKey] ?? []).length,
        lastInsertRowId: 0,
      };
    }
    return { changes: 0, lastInsertRowId: 0 };
  }

  execSync(source: string): void {
    this.assertReady();
    const trimmed = source.trim();
    // PRAGMA / DDL : gérés par le schéma Dexie (ignore, comme l'INSTEAD Plugins natif).
    if (
      /^PRAGMA/i.test(trimmed) ||
      /^CREATE\s+(TABLE|INDEX)/i.test(trimmed) ||
      /^BEGIN/i.test(trimmed) ||
      /^COMMIT/i.test(trimmed)
    ) {
      return;
    }
    throw new Error(`execSync non supporté sur web : ${source}`);
  }

  getAllSync<T = Record<string, unknown>>(
    source: string,
    params?: SQLiteBindParams,
  ): T[] {
    this.assertReady();
    const result = executeStatement(
      source,
      this.tables,
      this.normalizeParams(params),
    );
    if (result.kind !== "select") {
      throw new Error(`getAllSync attend un SELECT : ${source}`);
    }
    return result.rows as T[];
  }

  getFirstSync<T = Record<string, unknown>>(
    source: string,
    params?: SQLiteBindParams,
  ): T | null {
    const rows = this.getAllSync<T>(source, params);
    return rows.length > 0 ? rows[0] : null;
  }

  runSync(source: string, params?: SQLiteBindParams): SQLiteRunResult {
    this.assertReady();
    const result = executeStatement(
      source,
      this.tables,
      this.normalizeParams(params),
    );
    if (result.kind === "select") {
      throw new Error(`runSync attend une écriture : ${source}`);
    }
    return this.applyWrite(result);
  }

  closeSync(): void {
    if (this.dexie) {
      this.dexie.close();
      this.dexie = null;
    }
    this.readyPromise = null;
    this.tables = { categories: [], transactions: [], budgets: [] };
  }

  /** Attend la persistance IndexedDB de toutes les écritures en cours. */
  flushWrites(): Promise<void> {
    return this.writeQueue;
  }
}

const webDb = new WebWalletDB();

export function getDatabase(): WalletDatabase {
  return webDb;
}

export function closeDatabase(): void {
  webDb.closeSync();
}

export function runMigrations(): Promise<void> {
  return webDb.ready();
}

export function flushWrites(): Promise<void> {
  return webDb.flushWrites();
}
