// Wallet App - Initial Database Schema
// Version: 1
// Description: Creates tables for transactions, categories, and budgets

// Categories table
export const migration001 = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    is_default INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- Transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    category_id TEXT NOT NULL,
    date INTEGER NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  -- Budgets table
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    period_start INTEGER NOT NULL,
    period_end INTEGER NOT NULL,
    alert_threshold REAL DEFAULT 0.8,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(category_id, period_start)
  );

  -- Indexes for query performance
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);
  CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period_start, period_end);
  CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

  -- Insert default categories
  INSERT OR IGNORE INTO categories (id, name, icon, color, type, is_default, sort_order, created_at, updated_at) VALUES
    ('cat_food', 'Food & Dining', 'restaurant', '#FF6B6B', 'expense', 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_transport', 'Transportation', 'car', '#4ECDC4', 'expense', 1, 2, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_shopping', 'Shopping', 'bag', '#45B7D1', 'expense', 1, 3, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_entertainment', 'Entertainment', 'game-controller', '#96CEB4', 'expense', 1, 4, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_bills', 'Bills & Utilities', 'receipt', '#FFEAA7', 'expense', 1, 5, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_health', 'Healthcare', 'heart', '#DDA0DD', 'expense', 1, 6, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_education', 'Education', 'book', '#98D8C8', 'expense', 1, 7, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_other_expense', 'Other', 'more-horizontal', '#B8B8B8', 'expense', 1, 8, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_salary', 'Salary', 'cash', '#00C851', 'income', 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_freelance', 'Freelance', 'laptop', '#2BBBAD', 'income', 1, 2, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_investments', 'Investments', 'trending-up', '#33B5E5', 'income', 1, 3, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_gifts', 'Gifts', 'gift', '#AA66CC', 'income', 1, 4, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_other_income', 'Other', 'more-horizontal', '#B8B8B8', 'income', 1, 5, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
`;
