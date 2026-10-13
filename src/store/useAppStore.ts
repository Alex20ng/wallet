import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TransactionType, PeriodPreset, PeriodRange, FilterOptions, Category, Transaction, Budget, TransactionWithCategory } from '../types';
import { translate } from '../i18n';
import { getPeriodRange } from '../services/currency';
import { endOfMonth, startOfMonth } from '../services/date';
import { categoryRepository, transactionRepository, budgetRepository } from '../repositories';
import { flushWrites } from '../services/database';

export interface BudgetItem {
  budget: Budget;
  category: Category | null;
  spent: number;
}

interface DashboardStatsState {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; amount: number; percentage: number; transactionCount: number }[];
  incomeByCategory: { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; amount: number; percentage: number; transactionCount: number }[];
  dailyTrend: { date: string; income: number; expense: number }[];
  monthlyComparison: { month: string; income: number; expense: number; balance: number }[];
}

interface AppState {
  // UI State
  selectedPeriod: PeriodPreset;
  customPeriodStart: number | null;
  customPeriodEnd: number | null;
  currentPeriodRange: PeriodRange;
  filterType: TransactionType | 'all';
  selectedCategoryIds: string[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Data State
  categories: Category[];
  transactions: TransactionWithCategory[];
  budgets: Budget[];
  budgetItems: BudgetItem[];
  monthBudgetItems: BudgetItem[];
  budgetsPeriod: { start: number; end: number } | null;
  dashboardStats: DashboardStatsState | null;

  // Actions
  setPeriod: (preset: PeriodPreset, customStart?: number, customEnd?: number) => void;
  setFilterType: (type: TransactionType | 'all') => void;
  toggleCategoryFilter: (categoryId: string) => void;
  clearCategoryFilters: () => void;
  refreshData: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadTransactions: (options?: FilterOptions) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadBudgets: (periodStart?: number, periodEnd?: number) => Promise<void>;
  loadMonthBudgetItems: () => Promise<void>;
  addTransaction: (txn: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  upsertBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

function getCurrentMonthPeriod(): { start: number; end: number } {
  const now = new Date();
  return {
    start: startOfMonth(now).getTime(),
    end: endOfMonth(now).getTime(),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedPeriod: 'month',
      customPeriodStart: null,
      customPeriodEnd: null,
      currentPeriodRange: getPeriodRange('month'),
      filterType: 'all',
      selectedCategoryIds: [],
      isLoading: false,
      error: null,
      initialized: false,
      categories: [],
      transactions: [],
      budgets: [],
      budgetItems: [],
      monthBudgetItems: [],
      budgetsPeriod: null,
      dashboardStats: null,

      // Actions
      setPeriod: (preset, customStart, customEnd) => {
        const range = getPeriodRange(preset, customStart, customEnd);
        set({
          selectedPeriod: preset,
          customPeriodStart: customStart ?? null,
          customPeriodEnd: customEnd ?? null,
          currentPeriodRange: range,
        });
        get().loadDashboardStats();
        get().loadTransactions();
      },

      setFilterType: (type) => {
        set({ filterType: type });
        get().loadTransactions();
      },

      toggleCategoryFilter: (categoryId) => {
        const { selectedCategoryIds } = get();
        set({
          selectedCategoryIds: selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter(id => id !== categoryId)
            : [...selectedCategoryIds, categoryId],
        });
        get().loadTransactions();
      },

      clearCategoryFilters: () => {
        set({ selectedCategoryIds: [] });
        get().loadTransactions();
      },

      /**
       * Source de vérité unique : recharge toutes les données dépendantes.
       * À appeler après chaque mutation et au retour sur un écran (focus).
       * L'ordre importe : les catégories d'abord, car les budgets en dérivent.
       */
      refreshData: async () => {
        // Attend la persistance des écritures en cours (natif : no-op, web :
        // IndexedDB). Garantit qu'une suppression sur le web ne « revient »
        // pas après rechargement de la page.
        await flushWrites();
        await get().loadCategories();
        await get().loadDashboardStats();
        await get().loadTransactions();
        await get().loadBudgets();
        await get().loadMonthBudgetItems();
      },

      loadInitialData: async () => {
        const firstLoad = !get().initialized;
        if (firstLoad) set({ isLoading: true, error: null });
        try {
          await get().refreshData();
          set({ initialized: true });
        } catch {
          set({ error: translate('errors.loadData') });
        } finally {
          if (firstLoad) set({ isLoading: false });
        }
      },

      loadDashboardStats: async () => {
        const { currentPeriodRange } = get();
        try {
          const stats = transactionRepository.getDashboardStats(currentPeriodRange.start, currentPeriodRange.end);
          set({ dashboardStats: stats });
        } catch (error) {
          console.error('Failed to load dashboard stats:', error);
        }
      },

      loadTransactions: async (options) => {
        const { currentPeriodRange, filterType, selectedCategoryIds } = get();
        try {
          const transactions = transactionRepository.getAll({
            startDate: currentPeriodRange.start,
            endDate: currentPeriodRange.end,
            type: filterType !== 'all' ? filterType : undefined,
            categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
            ...options,
          });
          set({ transactions });
        } catch (error) {
          console.error('Failed to load transactions:', error);
        }
      },

      loadCategories: async () => {
        try {
          const categories = categoryRepository.getAll();
          set({ categories });
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      },

      loadBudgets: async (periodStart, periodEnd) => {
        const { budgetsPeriod } = get();
        const period =
          periodStart !== undefined && periodEnd !== undefined
            ? { start: periodStart, end: periodEnd }
            : budgetsPeriod ?? getCurrentMonthPeriod();
        try {
          const budgets = budgetRepository.getAll(period.start, period.end);
          const categories = get().categories;
          const spentByCategory = new Map(
            transactionRepository
              .getExpenseTotalsByCategory(period.start, period.end)
              .map((total) => [total.categoryId, total.amount]),
          );
          const budgetItems = budgets.map((budget) => ({
            budget,
            category: categories.find((c) => c.id === budget.categoryId) ?? null,
            spent: spentByCategory.get(budget.categoryId) ?? 0,
          }));
          set({ budgets, budgetItems, budgetsPeriod: period });
        } catch (error) {
          console.error('Failed to load budgets:', error);
        }
      },

      loadMonthBudgetItems: async () => {
        const period = getCurrentMonthPeriod();
        try {
          const budgets = budgetRepository.getAll(period.start, period.end);
          const categories = get().categories;
          const spentByCategory = new Map(
            transactionRepository
              .getExpenseTotalsByCategory(period.start, period.end)
              .map((total) => [total.categoryId, total.amount]),
          );
          const monthBudgetItems = budgets.map((budget) => ({
            budget,
            category: categories.find((c) => c.id === budget.categoryId) ?? null,
            spent: spentByCategory.get(budget.categoryId) ?? 0,
          }));
          set({ monthBudgetItems });
        } catch (error) {
          console.error('Failed to load month budgets:', error);
        }
      },

      addTransaction: async (txn) => {
        set({ isLoading: true });
        try {
          const created = transactionRepository.create(txn);
          await get().refreshData();
          return created;
        } catch (error) {
          set({ error: translate('errors.createTransaction') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTransaction: async (id, updates) => {
        set({ isLoading: true });
        try {
          const updated = transactionRepository.update(id, updates);
          if (updated) {
            await get().refreshData();
          }
          return updated;
        } catch (error) {
          set({ error: translate('errors.updateTransaction') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTransaction: async (id) => {
        set({ isLoading: true });
        try {
          const result = transactionRepository.delete(id);
          if (result) {
            await get().refreshData();
            return result;
          }
          // Aucune ligne supprimée : on remonte une erreur plutôt que
          // d'échouer silencieusement (l'écran garderait alors la dépense).
          throw new Error(translate('errors.deleteTransaction'));
        } catch (error) {
          set({ error: translate('errors.deleteTransaction') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      addCategory: async (category) => {
        set({ isLoading: true });
        try {
          const created = categoryRepository.create(category);
          await get().refreshData();
          return created;
        } catch (error) {
          set({ error: translate('errors.createCategory') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCategory: async (id, updates) => {
        set({ isLoading: true });
        try {
          const updated = categoryRepository.update(id, updates);
          if (updated) {
            await get().refreshData();
          }
          return updated;
        } catch (error) {
          set({ error: translate('errors.updateCategory') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCategory: async (id) => {
        set({ isLoading: true });
        try {
          const result = categoryRepository.delete(id);
          if (result) {
            await get().refreshData();
          }
          return result;
        } catch (error) {
          set({ error: translate('errors.deleteCategory') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      upsertBudget: async (budget) => {
        set({ isLoading: true });
        try {
          const created = budgetRepository.upsert(budget);
          set({ budgetsPeriod: { start: budget.periodStart, end: budget.periodEnd } });
          await get().refreshData();
          return created;
        } catch (error) {
          set({ error: translate('errors.saveBudget') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteBudget: async (id) => {
        set({ isLoading: true });
        try {
          const existing = budgetRepository.getById(id);
          const result = budgetRepository.delete(id);
          if (result) {
            if (existing) {
              set({ budgetsPeriod: { start: existing.periodStart, end: existing.periodEnd } });
            }
            await get().refreshData();
          }
          return result;
        } catch (error) {
          set({ error: translate('errors.deleteBudget') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'wallet-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedPeriod: state.selectedPeriod,
        customPeriodStart: state.customPeriodStart,
        customPeriodEnd: state.customPeriodEnd,
        filterType: state.filterType,
        selectedCategoryIds: state.selectedCategoryIds,
      }),
    }
  )
);
