import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TransactionType, PeriodPreset, PeriodRange, FilterOptions, Category, Transaction, Budget, TransactionWithCategory } from '../types';
import { getPeriodRange } from '../services/currency';
import { categoryRepository, transactionRepository, budgetRepository } from '../repositories';

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

  // Data State
  categories: Category[];
  transactions: TransactionWithCategory[];
  budgets: Budget[];
  dashboardStats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expenseByCategory: { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; amount: number; percentage: number; transactionCount: number }[];
    incomeByCategory: { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; amount: number; percentage: number; transactionCount: number }[];
    dailyTrend: { date: string; income: number; expense: number }[];
    monthlyComparison: { month: string; income: number; expense: number; balance: number }[];
  } | null;

  // Actions
  setPeriod: (preset: PeriodPreset, customStart?: number, customEnd?: number) => void;
  setFilterType: (type: TransactionType | 'all') => void;
  toggleCategoryFilter: (categoryId: string) => void;
  clearCategoryFilters: () => void;
  loadInitialData: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadTransactions: (options?: FilterOptions) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadBudgets: (periodStart?: number, periodEnd?: number) => Promise<void>;
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
      categories: [],
      transactions: [],
      budgets: [],
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

      loadInitialData: async () => {
        set({ isLoading: true, error: null });
        try {
          await Promise.all([
            get().loadCategories(),
            get().loadBudgets(),
          ]);
          await get().loadDashboardStats();
          await get().loadTransactions();
        } catch {
          set({ error: 'Erreur lors du chargement des données' });
        } finally {
          set({ isLoading: false });
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
        const { currentPeriodRange } = get();
        const start = periodStart ?? currentPeriodRange.start;
        const end = periodEnd ?? currentPeriodRange.end;
        try {
          const budgets = budgetRepository.getAll(start, end);
          set({ budgets });
        } catch (error) {
          console.error('Failed to load budgets:', error);
        }
      },

      addTransaction: async (txn) => {
        set({ isLoading: true });
        try {
          const created = transactionRepository.create(txn);
          await get().loadTransactions();
          await get().loadDashboardStats();
          await get().loadBudgets();
          return created;
        } catch (error) {
          set({ error: 'Erreur lors de la création de la transaction' });
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
            await get().loadTransactions();
            await get().loadDashboardStats();
            await get().loadBudgets();
          }
          return updated;
        } catch (error) {
          set({ error: 'Erreur lors de la modification de la transaction' });
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
            await get().loadTransactions();
            await get().loadDashboardStats();
            await get().loadBudgets();
          }
          return result;
        } catch (error) {
          set({ error: 'Erreur lors de la suppression de la transaction' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      addCategory: async (category) => {
        set({ isLoading: true });
        try {
          const created = categoryRepository.create(category);
          await get().loadCategories();
          return created;
        } catch (error) {
          set({ error: 'Erreur lors de la création de la catégorie' });
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
            await get().loadCategories();
            await get().loadDashboardStats();
            await get().loadTransactions();
          }
          return updated;
        } catch (error) {
          set({ error: 'Erreur lors de la modification de la catégorie' });
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
            await get().loadCategories();
            await get().loadDashboardStats();
          }
          return result;
        } catch (error) {
          set({ error: 'Erreur lors de la suppression de la catégorie' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      upsertBudget: async (budget) => {
        set({ isLoading: true });
        try {
          const created = budgetRepository.upsert(budget);
          await get().loadBudgets(budget.periodStart, budget.periodEnd);
          await get().loadDashboardStats();
          return created;
        } catch (error) {
          set({ error: 'Erreur lors de la sauvegarde du budget' });
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
              await get().loadBudgets(existing.periodStart, existing.periodEnd);
            } else {
              await get().loadBudgets();
            }
            await get().loadDashboardStats();
          }
          return result;
        } catch (error) {
          set({ error: 'Erreur lors de la suppression du budget' });
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