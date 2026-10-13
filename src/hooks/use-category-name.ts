import {
  DEFAULT_CATEGORY_LABELS,
  DEFAULT_CATEGORY_SOURCE_NAMES,
} from "@/constants/default-categories";
import { translate, useTranslation, type TranslationKey } from "@/i18n";
import type { Category } from "@/types";
import { useCallback } from "react";

export type CategoryLike = Pick<Category, "id" | "name" | "isDefault">;

/**
 * Clé de traduction applicable à une catégorie par défaut, ou `null`.
 * La traduction ne s'applique que si l'utilisateur n'a pas renommé la
 * catégorie (le nom en base correspond encore à l'original).
 */
export function getCategoryNameKey(
  category: CategoryLike | null | undefined,
): TranslationKey | null {
  if (!category || !category.isDefault) return null;
  const sourceName = DEFAULT_CATEGORY_SOURCE_NAMES[category.id];
  if (sourceName === undefined || category.name !== sourceName) return null;
  return DEFAULT_CATEGORY_LABELS[category.id] ?? null;
}

/** Nom localisé d'une catégorie, utilisable hors React (notifications…). */
export function getLocalizedCategoryName(
  category: CategoryLike | null | undefined,
): string | null {
  const key = getCategoryNameKey(category);
  if (key) return translate(key);
  return category?.name ?? null;
}

/**
 * Hook : renvoie une fonction qui localise le nom d'une catégorie par défaut.
 * Se réabonne à la langue via `useTranslation`, donc le composant est
 * re-rendu quand l'utilisateur change de langue.
 */
export function useCategoryName() {
  const { t } = useTranslation();

  const categoryName = useCallback(
    (category: CategoryLike | null | undefined) =>
      getLocalizedCategoryName(category) ?? t("common.unknownCategory"),
    [t],
  );

  return categoryName;
}
