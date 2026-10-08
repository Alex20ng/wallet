export type TransactionType = 'expense' | 'income';

export type CategoryType = 'expense' | 'income' | 'both';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  amount: number; // Stored in cents
  type: TransactionType;
  categoryId: string;
  date: number; // Unix timestamp in milliseconds
  note: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // Monthly budget in cents
  periodStart: number; // Month start timestamp
  periodEnd: number; // Month end timestamp
  alertThreshold: number; // 0-1, default 0.8
  createdAt: number;
  updatedAt: number;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface CategoryWithBudget extends Category {
  budget?: Budget;
  spent?: number; // Amount spent in current period
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: CategorySpending[];
  incomeByCategory: CategorySpending[];
  dailyTrend: DailyAmount[];
  monthlyComparison: MonthlyComparison[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyAmount {
  date: string; // YYYY-MM-DD
  income: number;
  expense: number;
}

export interface MonthlyComparison {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

export interface FilterOptions {
  startDate: number;
  endDate: number;
  type?: TransactionType;
  categoryIds?: string[];
}

export type PeriodPreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface PeriodRange {
  start: number;
  end: number;
  label: string;
}