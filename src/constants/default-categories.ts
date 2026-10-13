import type { TranslationKey } from "@/i18n";

/**
 * Clés de traduction des catégories par défaut, indexées par id stocké.
 * Le nom en base reste l'original (anglais) ; l'affichage applique la
 * traduction tant que l'utilisateur n'a pas personnalisé la catégorie.
 */
export const DEFAULT_CATEGORY_LABELS: Record<string, TranslationKey> = {
  cat_food: "defaultCategory.food",
  cat_transport: "defaultCategory.transport",
  cat_shopping: "defaultCategory.shopping",
  cat_entertainment: "defaultCategory.entertainment",
  cat_bills: "defaultCategory.bills",
  cat_health: "defaultCategory.health",
  cat_education: "defaultCategory.education",
  cat_other_expense: "defaultCategory.otherExpense",
  cat_salary: "defaultCategory.salary",
  cat_freelance: "defaultCategory.freelance",
  cat_investments: "defaultCategory.investments",
  cat_gifts: "defaultCategory.gifts",
  cat_other_income: "defaultCategory.otherIncome",
};

/**
 * Noms d'origine (anglais) des catégories par défaut, identiques à ceux
 * insérés par `migrations/001_initial.ts` et `database.web.ts`.
 *
 * Une catégorie par défaut n'est traduite que si son nom en base correspond
 * encore à l'original : si l'utilisateur l'a renommée, son propre nom prime.
 */
export const DEFAULT_CATEGORY_SOURCE_NAMES: Record<string, string> = {
  cat_food: "Food & Dining",
  cat_transport: "Transportation",
  cat_shopping: "Shopping",
  cat_entertainment: "Entertainment",
  cat_bills: "Bills & Utilities",
  cat_health: "Healthcare",
  cat_education: "Education",
  cat_other_expense: "Other",
  cat_salary: "Salary",
  cat_freelance: "Freelance",
  cat_investments: "Investments",
  cat_gifts: "Gifts",
  cat_other_income: "Other",
};
