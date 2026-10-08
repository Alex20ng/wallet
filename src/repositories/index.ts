import { getDatabase } from '../database/connection';
import type { Category, Transaction, Budget, FilterOptions, TransactionWithCategory, CategoryWithBudget, DashboardStats, CategorySpending, DailyAmount, MonthlyComparison } from '../types';

type Row = Record<string, unknown>;

function asRows(result: unknown): Row[] {
  return result as Row[];
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function mapRowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    icon: row.icon as string,
    color: row.color as string,
    type: row.type as Category['type'],
    isDefault: Boolean(row.is_default),
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function mapRowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    amount: row.amount as number,
    type: row.type as Transaction['type'],
    categoryId: row.category_id as string,
    date: row.date as number,
    note: row.note as string | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function mapRowToBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    amount: row.amount as number,
    periodStart: row.period_start as number,
    periodEnd: row.period_end as number,
    alertThreshold: row.alert_threshold as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export const categoryRepository = {
  getAll(): Category[] {
    const db = getDatabase();
    const rows = asRows(db.getAllSync('SELECT * FROM categories ORDER BY sort_order ASC'));
    return rows.map(mapRowToCategory);
  },

  getByType(type: Category['type']): Category[] {
    const db = getDatabase();
    const rows = asRows(db.getAllSync(
      'SELECT * FROM categories WHERE type = ? OR type = ? ORDER BY sort_order ASC',
      [type, 'both']
    ));
    return rows.map(mapRowToCategory);
  },

  getById(id: string): Category | null {
    const db = getDatabase();
    const row = db.getFirstSync('SELECT * FROM categories WHERE id = ?', [id]) as Record<string, unknown> | null;
    return row ? mapRowToCategory(row) : null;
  },

  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const db = getDatabase();
    const now = getCurrentTimestamp();
    const id = generateId('cat');
    db.runSync(
      `INSERT INTO categories (id, name, icon, color, type, is_default, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category.name, category.icon, category.color, category.type, category.isDefault ? 1 : 0, category.sortOrder, now, now]
    );
    return { ...category, id, createdAt: now, updatedAt: now };
  },

  update(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: getCurrentTimestamp() };
    db.runSync(
      `UPDATE categories SET name = ?, icon = ?, color = ?, type = ?, is_default = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
      [updated.name, updated.icon, updated.color, updated.type, updated.isDefault ? 1 : 0, updated.sortOrder, updated.updatedAt, id]
    );
    return updated;
  },

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM categories WHERE id = ? AND is_default = 0', [id]);
    return result.changes > 0;
  },

  getWithBudget(periodStart: number, periodEnd: number): CategoryWithBudget[] {
    const db = getDatabase();
    const rows = asRows(db.getAllSync(
      `SELECT c.*, b.amount as budget_amount, b.id as budget_id, b.alert_threshold
       FROM categories c
       LEFT JOIN budgets b ON c.id = b.category_id AND b.period_start = ? AND b.period_end = ?
       WHERE c.type IN ('expense', 'both')
       ORDER BY c.sort_order ASC`,
      [periodStart, periodEnd]
    ));

    return rows.map((row) => {
      const category = mapRowToCategory(row);
      return {
        ...category,
        budget: row.budget_id ? {
          id: row.budget_id as string,
          categoryId: category.id,
          amount: row.budget_amount as number,
          periodStart,
          periodEnd,
          alertThreshold: row.alert_threshold as number,
          createdAt: 0,
          updatedAt: 0,
        } : undefined,
      };
    });
  },
};

export const transactionRepository = {
  getAll(options?: FilterOptions): TransactionWithCategory[] {
    const db = getDatabase();
    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.type as category_type
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (options?.startDate) {
      query += ' AND t.date >= ?';
      params.push(options.startDate);
    }
    if (options?.endDate) {
      query += ' AND t.date <= ?';
      params.push(options.endDate);
    }
    if (options?.type) {
      query += ' AND t.type = ?';
      params.push(options.type);
    }
    if (options?.categoryIds?.length) {
      query += ` AND t.category_id IN (${options.categoryIds.map(() => '?').join(',')})`;
      params.push(...options.categoryIds);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    const rows = asRows(db.getAllSync(query, params));
    return rows.map((row) => ({
      ...mapRowToTransaction(row),
      category: {
        id: row.category_id as string,
        name: row.category_name as string,
        icon: row.category_icon as string,
        color: row.category_color as string,
        type: row.category_type as Category['type'],
        isDefault: false,
        sortOrder: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    }));
  },

  getById(id: string): TransactionWithCategory | null {
    const db = getDatabase();
    const row = db.getFirstSync(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.type as category_type
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    ) as Record<string, unknown> | null;

    if (!row) return null;

    return {
      ...mapRowToTransaction(row),
      category: {
        id: row.category_id as string,
        name: row.category_name as string,
        icon: row.category_icon as string,
        color: row.category_color as string,
        type: row.category_type as Category['type'],
        isDefault: false,
        sortOrder: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    };
  },

  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const db = getDatabase();
    const now = getCurrentTimestamp();
    const id = generateId('txn');
    db.runSync(
      `INSERT INTO transactions (id, amount, type, category_id, date, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, transaction.amount, transaction.type, transaction.categoryId, transaction.date, transaction.note, now, now]
    );
    return { ...transaction, id, createdAt: now, updatedAt: now };
  },

  update(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Transaction | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: getCurrentTimestamp() };
    db.runSync(
      `UPDATE transactions SET amount = ?, type = ?, category_id = ?, date = ?, note = ?, updated_at = ? WHERE id = ?`,
      [updated.amount, updated.type, updated.categoryId, updated.date, updated.note, updated.updatedAt, id]
    );
    return updated;
  },

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
    return result.changes > 0;
  },

  getDashboardStats(startDate: number, endDate: number): DashboardStats {
    const db = getDatabase();

    // Total income and expense
    const totals = db.getFirstSync(
      `SELECT 
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
       FROM transactions
       WHERE date >= ? AND date <= ?`,
      [startDate, endDate]
    ) as Record<string, unknown> | null;

    const totalIncome = totals?.total_income as number || 0;
    const totalExpense = totals?.total_expense as number || 0;

    // Expense by category
    const expenseRows = asRows(db.getAllSync(
      `SELECT c.id, c.name, c.icon, c.color, SUM(t.amount) as amount, COUNT(*) as count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' AND t.date >= ? AND t.date <= ?
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY amount DESC`,
      [startDate, endDate]
    ));

    const expenseByCategory: CategorySpending[] = expenseRows.map((row) => ({
      categoryId: row.id as string,
      categoryName: row.name as string,
      categoryIcon: row.icon as string,
      categoryColor: row.color as string,
      amount: row.amount as number,
      percentage: totalExpense > 0 ? (row.amount as number) / totalExpense * 100 : 0,
      transactionCount: row.count as number,
    }));

    // Income by category
    const incomeRows = asRows(db.getAllSync(
      `SELECT c.id, c.name, c.icon, c.color, SUM(t.amount) as amount, COUNT(*) as count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'income' AND t.date >= ? AND t.date <= ?
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY amount DESC`,
      [startDate, endDate]
    ));

    const incomeByCategory: CategorySpending[] = incomeRows.map((row) => ({
      categoryId: row.id as string,
      categoryName: row.name as string,
      categoryIcon: row.icon as string,
      categoryColor: row.color as string,
      amount: row.amount as number,
      percentage: totalIncome > 0 ? (row.amount as number) / totalIncome * 100 : 0,
      transactionCount: row.count as number,
    }));

    // Daily trend (last 30 days)
    const dailyRows = asRows(db.getAllSync(
      `SELECT 
         date(date/1000, 'unixepoch') as day,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE date >= ? AND date <= ?
       GROUP BY day
       ORDER BY day ASC`,
      [startDate, endDate]
    ));

    const dailyTrend: DailyAmount[] = dailyRows.map((row) => ({
      date: row.day as string,
      income: row.income as number,
      expense: row.expense as number,
    }));

    // Monthly comparison (last 6 months)
    const monthlyRows = asRows(db.getAllSync(
      `SELECT 
         strftime('%Y-%m', date/1000, 'unixepoch') as month,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE date >= date('now', '-6 months', 'start of month') * 1000
       GROUP BY month
       ORDER BY month ASC`
    ));

    const monthlyComparison: MonthlyComparison[] = monthlyRows.map((row) => ({
      month: row.month as string,
      income: row.income as number,
      expense: row.expense as number,
      balance: (row.income as number) - (row.expense as number),
    }));

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expenseByCategory,
      incomeByCategory,
      dailyTrend,
      monthlyComparison,
    };
  },

  getMonthlyTotal(type: Transaction['type'], year: number, month: number): number {
    const db = getDatabase();
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const row = db.getFirstSync(
      `SELECT SUM(amount) as total FROM transactions WHERE type = ? AND date >= ? AND date <= ?`,
      [type, start, end]
    ) as Record<string, unknown> | null;

    return (row?.total as number) || 0;
  },
};

export const budgetRepository = {
  getAll(periodStart: number, periodEnd: number): Budget[] {
    const db = getDatabase();
    const rows = asRows(db.getAllSync(
      'SELECT * FROM budgets WHERE period_start = ? AND period_end = ?',
      [periodStart, periodEnd]
    ));
    return rows.map(mapRowToBudget);
  },

  getByCategory(categoryId: string, periodStart: number): Budget | null {
    const db = getDatabase();
    const row = db.getFirstSync(
      'SELECT * FROM budgets WHERE category_id = ? AND period_start = ?',
      [categoryId, periodStart]
    ) as Record<string, unknown> | null;
    return row ? mapRowToBudget(row) : null;
  },

  create(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const db = getDatabase();
    const now = getCurrentTimestamp();
    const id = generateId('budget');
    db.runSync(
      `INSERT INTO budgets (id, category_id, amount, period_start, period_end, alert_threshold, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, budget.categoryId, budget.amount, budget.periodStart, budget.periodEnd, budget.alertThreshold, now, now]
    );
    return { ...budget, id, createdAt: now, updatedAt: now };
  },

  upsert(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const existing = this.getByCategory(budget.categoryId, budget.periodStart);
    if (existing) {
      const updated = this.update(existing.id, {
        amount: budget.amount,
        alertThreshold: budget.alertThreshold,
        periodEnd: budget.periodEnd,
      });
      return updated!;
    }
    return this.create(budget);
  },

  update(id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>): Budget | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const updatedAt = getCurrentTimestamp();
    const amount = updates.amount ?? existing.amount;
    const alertThreshold = updates.alertThreshold ?? existing.alertThreshold;
    const periodEnd = updates.periodEnd ?? existing.periodEnd;
    db.runSync(
      `UPDATE budgets SET amount = ?, alert_threshold = ?, period_end = ?, updated_at = ? WHERE id = ?`,
      [amount, alertThreshold, periodEnd, updatedAt, id]
    );

    return {
      ...existing,
      amount,
      alertThreshold,
      periodEnd,
      updatedAt,
    };
  },

  getById(id: string): Budget | null {
    const db = getDatabase();
    const row = db.getFirstSync('SELECT * FROM budgets WHERE id = ?', [id]) as Record<string, unknown> | null;
    return row ? mapRowToBudget(row) : null;
  },

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM budgets WHERE id = ?', [id]);
    return result.changes > 0;
  },
};