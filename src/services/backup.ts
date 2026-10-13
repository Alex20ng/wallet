// Sauvegarde / restauration des données, partagé natif & web.
//
// - JSON : sauvegarde complète (catégories, transactions, budgets), restauration
//   fidèle (identifiants conservés) en mode « remplacer » ou « fusionner ».
// - CSV  : export lisible (tableur) de la table des transactions ; l'import crée
//   ou réutilise les catégories portant le même nom.
//
// Les écritures passent par le SQL brut de `getDatabase()` afin de préserver les
// identifiants (indispensables aux références transaction → catégorie → budget).

import {
  mapRowToBudget,
  mapRowToCategory,
  mapRowToTransaction,
} from "../repositories";
import type { Budget, Category, Transaction, TransactionType } from "../types";
import { getDatabase } from "./database";
import { generateColor } from "./currency";
import { parseDateInput } from "./date";

export const BACKUP_APP = "wallet";
export const BACKUP_VERSION = 1;

export interface BackupData {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

export interface BackupPayload {
  app: string;
  version: number;
  exportedAt: string;
  data: BackupData;
}

export type ImportMode = "replace" | "merge";

export interface ImportResult {
  categories: number;
  transactions: number;
  budgets: number;
}

export class BackupError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "BackupError";
  }
}

type DB = ReturnType<typeof getDatabase>;
type Row = Record<string, unknown>;

const CSV_COLUMNS = ["date", "type", "amount", "category", "note"] as const;

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toISODate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Horodatage `YYYY-MM-DD` (heure locale) pour nommer les fichiers exportés. */
export function timestampForFilename(): string {
  return toISODate(Date.now());
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeCategory(raw: unknown, index: number): Category {
  const row = (raw ?? {}) as Row;
  const id = asString(row.id, "");
  if (!id) throw new BackupError("invalid-category");
  const type = row.type === "income" || row.type === "both" ? row.type : "expense";
  const now = Date.now();
  return {
    id,
    name: asString(row.name, id),
    icon: asString(row.icon, "more-horizontal"),
    color: asString(row.color, "#B8B8B8"),
    type,
    isDefault: Boolean(row.isDefault),
    sortOrder: asNumber(row.sortOrder, index + 1),
    createdAt: asNumber(row.createdAt, now),
    updatedAt: asNumber(row.updatedAt, now),
  };
}

function normalizeTransaction(raw: unknown): Transaction {
  const row = (raw ?? {}) as Row;
  const id = asString(row.id, "");
  const categoryId = asString(row.categoryId, "");
  if (!id || !categoryId) throw new BackupError("invalid-transaction");
  const now = Date.now();
  return {
    id,
    amount: Math.round(asNumber(row.amount, 0)),
    type: row.type === "income" ? "income" : "expense",
    categoryId,
    date: asNumber(row.date, now),
    note: asNullableString(row.note),
    createdAt: asNumber(row.createdAt, now),
    updatedAt: asNumber(row.updatedAt, now),
  };
}

function normalizeBudget(raw: unknown): Budget {
  const row = (raw ?? {}) as Row;
  const id = asString(row.id, "");
  const categoryId = asString(row.categoryId, "");
  if (!id || !categoryId) throw new BackupError("invalid-budget");
  const now = Date.now();
  const periodStart = asNumber(row.periodStart, now);
  return {
    id,
    categoryId,
    amount: Math.round(asNumber(row.amount, 0)),
    periodStart,
    periodEnd: asNumber(row.periodEnd, periodStart),
    alertThreshold: asNumber(row.alertThreshold, 0.8),
    createdAt: asNumber(row.createdAt, now),
    updatedAt: asNumber(row.updatedAt, now),
  };
}

// ---------------------------------------------------------------------------
// JSON — export
// ---------------------------------------------------------------------------

export function buildBackupPayload(): BackupPayload {
  const db = getDatabase();
  const categories = (
    db.getAllSync("SELECT * FROM categories ORDER BY sort_order ASC") as Row[]
  ).map(mapRowToCategory);
  const transactions = (
    db.getAllSync("SELECT * FROM transactions ORDER BY date ASC, created_at ASC") as Row[]
  ).map(mapRowToTransaction);
  const budgets = (
    db.getAllSync("SELECT * FROM budgets ORDER BY period_start ASC") as Row[]
  ).map(mapRowToBudget);
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { categories, transactions, budgets },
  };
}

export function serializeBackup(): string {
  return JSON.stringify(buildBackupPayload(), null, 2);
}

// ---------------------------------------------------------------------------
// JSON — import
// ---------------------------------------------------------------------------

export function parseBackupJSON(content: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new BackupError("invalid-json");
  }
  if (!parsed || typeof parsed !== "object") throw new BackupError("invalid-format");

  const root = parsed as Row;
  const data = (root.data ?? root) as Row;
  const categoriesRaw = data?.categories;
  const transactionsRaw = data?.transactions;
  const budgetsRaw = data?.budgets;
  if (
    !Array.isArray(categoriesRaw) ||
    !Array.isArray(transactionsRaw) ||
    !Array.isArray(budgetsRaw)
  ) {
    throw new BackupError("invalid-format");
  }

  return {
    app: asString(root.app, BACKUP_APP),
    version: asNumber(root.version, BACKUP_VERSION),
    exportedAt: asString(root.exportedAt, new Date().toISOString()),
    data: {
      categories: categoriesRaw.map(normalizeCategory),
      transactions: transactionsRaw.map(normalizeTransaction),
      budgets: budgetsRaw.map(normalizeBudget),
    },
  };
}

// ---------------------------------------------------------------------------
// CSV — export
// ---------------------------------------------------------------------------

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function hasTransactions(): boolean {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT COUNT(*) as count FROM transactions") as Row | null;
  return asNumber(row?.count, 0) > 0;
}

export function serializeTransactionsCSV(): string {
  const db = getDatabase();
  const categories = (
    db.getAllSync("SELECT * FROM categories") as Row[]
  ).map(mapRowToCategory);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const transactions = (
    db.getAllSync("SELECT * FROM transactions ORDER BY date ASC, created_at ASC") as Row[]
  ).map(mapRowToTransaction);

  const lines = [CSV_COLUMNS.join(",")];
  for (const t of transactions) {
    lines.push(
      [
        toISODate(t.date),
        t.type,
        (t.amount / 100).toFixed(2),
        csvEscape(nameById.get(t.categoryId) ?? ""),
        csvEscape(t.note ?? ""),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}

// ---------------------------------------------------------------------------
// CSV — import
// ---------------------------------------------------------------------------

/** Décode un CSV (RFC 4180) en lignes de champs, en respectant les guillemets. */
function parseCSV(content: string): string[][] {
  let text = content;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

const HEADER_ALIASES: Record<string, (typeof CSV_COLUMNS)[number]> = {
  date: "date",
  jour: "date",
  type: "type",
  amount: "amount",
  montant: "amount",
  valeur: "amount",
  somme: "amount",
  category: "category",
  categorie: "category",
  note: "note",
  notes: "note",
  description: "note",
  libelle: "note",
  memo: "note",
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
}

function parseAmountCents(value: string): number {
  const cleaned = value
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function parseCSVDate(value: string): number {
  const trimmed = value.trim();
  const parsed = parseDateInput(trimmed);
  if (parsed) return parsed.getTime();
  const fallback = Date.parse(trimmed);
  return Number.isFinite(fallback) ? fallback : Date.now();
}

function parseType(value: string): TransactionType {
  const normalized = normalizeHeader(value);
  return /revenu|recette|income|entree|credit/.test(normalized)
    ? "income"
    : "expense";
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function importTransactionsCSV(content: string): ImportResult {
  const parsed = parseCSV(content);
  if (parsed.length === 0) throw new BackupError("empty-csv");

  const header = parsed[0].map(normalizeHeader);
  const columns: Record<string, number> = {};
  header.forEach((token, index) => {
    const canonical = HEADER_ALIASES[token];
    if (canonical && columns[canonical] === undefined) columns[canonical] = index;
  });

  if (columns.date === undefined || columns.amount === undefined) {
    throw new BackupError("invalid-csv-header");
  }

  const db = getDatabase();
  const existing = (
    db.getAllSync("SELECT * FROM categories") as Row[]
  ).map(mapRowToCategory);

  const findCategory = (name: string, type: TransactionType): Category | undefined => {
    const key = name.trim().toLowerCase();
    return (
      existing.find((c) => c.name.trim().toLowerCase() === key && c.type === type) ??
      existing.find(
        (c) => c.name.trim().toLowerCase() === key && c.type === "both",
      )
    );
  };

  const cell = (row: string[], column: string): string => {
    const index = columns[column];
    return index === undefined ? "" : (row[index] ?? "");
  };

  let maxSort = existing.reduce((max, c) => Math.max(max, c.sortOrder), 0);
  const createdCategories: Category[] = [];
  const transactions: Transaction[] = [];

  for (let i = 1; i < parsed.length; i += 1) {
    const row = parsed[i];
    const type = parseType(cell(row, "type"));
    const categoryName = cell(row, "category").trim();
    let category = categoryName ? findCategory(categoryName, type) : undefined;

    if (!category) {
      const now = Date.now();
      category = {
        id: generateId("cat"),
        name: categoryName || (type === "income" ? "Income" : "Expense"),
        icon: "more-horizontal",
        color: generateColor(),
        type,
        isDefault: false,
        sortOrder: (maxSort += 1),
        createdAt: now,
        updatedAt: now,
      };
      createdCategories.push(category);
      existing.push(category);
    }

    transactions.push({
      id: generateId("txn"),
      amount: parseAmountCents(cell(row, "amount")),
      type,
      categoryId: category.id,
      date: parseCSVDate(cell(row, "date")),
      note: cell(row, "note").trim() || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  db.execSync("BEGIN");
  try {
    for (const category of createdCategories) {
      insertCategory(db, category);
    }
    for (const transaction of transactions) {
      insertTransaction(db, transaction);
    }
    db.execSync("COMMIT");
  } catch (error) {
    try {
      db.execSync("ROLLBACK");
    } catch {
      // web : pas de vraie transaction, ROLLBACK ignoré
    }
    throw error;
  }

  return {
    categories: createdCategories.length,
    transactions: transactions.length,
    budgets: 0,
  };
}

// ---------------------------------------------------------------------------
// Écritures SQL (préserve les identifiants)
// ---------------------------------------------------------------------------

function existsById(db: DB, table: string, id: string): boolean {
  return db.getFirstSync(`SELECT id FROM ${table} WHERE id = ?`, [id]) !== null;
}

function insertCategory(db: DB, c: Category): void {
  db.runSync(
    `INSERT INTO categories (id, name, icon, color, type, is_default, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [c.id, c.name, c.icon, c.color, c.type, c.isDefault ? 1 : 0, c.sortOrder, c.createdAt, c.updatedAt],
  );
}

function updateCategory(db: DB, c: Category): void {
  db.runSync(
    `UPDATE categories SET name = ?, icon = ?, color = ?, type = ?, is_default = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
    [c.name, c.icon, c.color, c.type, c.isDefault ? 1 : 0, c.sortOrder, Date.now(), c.id],
  );
}

function insertTransaction(db: DB, t: Transaction): void {
  db.runSync(
    `INSERT INTO transactions (id, amount, type, category_id, date, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [t.id, t.amount, t.type, t.categoryId, t.date, t.note, t.createdAt, t.updatedAt],
  );
}

function updateTransaction(db: DB, t: Transaction): void {
  db.runSync(
    `UPDATE transactions SET amount = ?, type = ?, category_id = ?, date = ?, note = ?, updated_at = ? WHERE id = ?`,
    [t.amount, t.type, t.categoryId, t.date, t.note, Date.now(), t.id],
  );
}

function insertBudget(db: DB, b: Budget): void {
  db.runSync(
    `INSERT INTO budgets (id, category_id, amount, period_start, period_end, alert_threshold, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [b.id, b.categoryId, b.amount, b.periodStart, b.periodEnd, b.alertThreshold, b.createdAt, b.updatedAt],
  );
}

function updateBudget(db: DB, b: Budget): void {
  db.runSync(
    `UPDATE budgets SET category_id = ?, amount = ?, period_start = ?, period_end = ?, alert_threshold = ?, updated_at = ? WHERE id = ?`,
    [b.categoryId, b.amount, b.periodStart, b.periodEnd, b.alertThreshold, Date.now(), b.id],
  );
}

export function applyBackup(payload: BackupPayload, mode: ImportMode): ImportResult {
  const db = getDatabase();

  const validCategoryIds = new Set(payload.data.categories.map((c) => c.id));
  if (mode === "merge") {
    for (const row of db.getAllSync("SELECT id FROM categories") as Row[]) {
      validCategoryIds.add(String(row.id));
    }
  }

  const categories = payload.data.categories;
  const transactions = payload.data.transactions.filter((t) =>
    validCategoryIds.has(t.categoryId),
  );
  const budgets = payload.data.budgets.filter((b) =>
    validCategoryIds.has(b.categoryId),
  );

  db.execSync("BEGIN");
  try {
    if (mode === "replace") {
      db.runSync("DELETE FROM transactions");
      db.runSync("DELETE FROM budgets");
      db.runSync("DELETE FROM categories");
    }

    for (const category of categories) {
      if (mode === "merge" && existsById(db, "categories", category.id)) {
        updateCategory(db, category);
      } else {
        insertCategory(db, category);
      }
    }
    for (const transaction of transactions) {
      if (mode === "merge" && existsById(db, "transactions", transaction.id)) {
        updateTransaction(db, transaction);
      } else {
        insertTransaction(db, transaction);
      }
    }
    for (const budget of budgets) {
      if (mode === "merge" && existsById(db, "budgets", budget.id)) {
        updateBudget(db, budget);
      } else {
        insertBudget(db, budget);
      }
    }

    db.execSync("COMMIT");
  } catch (error) {
    try {
      db.execSync("ROLLBACK");
    } catch {
      // web : pas de vraie transaction, ROLLBACK ignoré
    }
    throw error;
  }

  return {
    categories: categories.length,
    transactions: transactions.length,
    budgets: budgets.length,
  };
}
