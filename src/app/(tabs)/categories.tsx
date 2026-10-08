import CategoryFormSheet, {
  type CategoryFormSheetRef,
} from "@/components/categories/CategoryFormSheet";
import { CategoryGrid, EmptyState, Screen } from "@/components/layout";
import { ThemedText, ThemedView } from "@/components/ui";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useAppStore } from "@/store/useAppStore";
import type { Category } from "@/types";
import { Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";

export default function CategoriesScreen() {
  const { loadCategories, loadInitialData, categories } = useAppStore();
  const colors = useTheme();
  const sheetRef = React.useRef<CategoryFormSheetRef>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleOpenCreate = () => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present();
  };

  const handleEdit = (category: Category) => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present(category);
  };

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" || c.type === "both"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income" || c.type === "both"),
    [categories],
  );

  const expenseTotal = expenseCategories.length;
  const incomeTotal = incomeCategories.length;
  const isEmpty = categories.length === 0;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <ThemedText
            variant="caption"
            color="tertiary"
            style={styles.pageDate}
          >
            {categories.length} catégor{categories.length > 1 ? "ies" : "ie"}
          </ThemedText>
          <ThemedText variant="headline" weight="bold">
            Catégories
          </ThemedText>
        </View>
        <Pressable
          onPress={handleOpenCreate}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Créer une catégorie"
        >
          <Plus size={22} strokeWidth={2.6} color="#FFFFFF" />
        </Pressable>
      </View>

      {expenseTotal > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionDot, { backgroundColor: colors.error }]}
            />
            <ThemedText variant="subtitle" weight="bold">
              Dépenses
            </ThemedText>
            <ThemedText variant="caption" color="tertiary">
              {expenseTotal}
            </ThemedText>
          </View>
          <CategoryGrid
            categories={expenseCategories}
            selectedIds={[]}
            onSelect={(id) => {
              const category = categories.find((c) => c.id === id);
              if (category) handleEdit(category);
            }}
          />
        </View>
      )}

      {incomeTotal > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionDot, { backgroundColor: colors.success }]}
            />
            <ThemedText variant="subtitle" weight="bold">
              Revenus
            </ThemedText>
            <ThemedText variant="caption" color="tertiary">
              {incomeTotal}
            </ThemedText>
          </View>
          <CategoryGrid
            categories={incomeCategories}
            selectedIds={[]}
            onSelect={(id) => {
              const category = categories.find((c) => c.id === id);
              if (category) handleEdit(category);
            }}
          />
        </View>
      )}

      {isEmpty && (
        <ThemedView variant="surface" style={styles.emptyCard}>
          <EmptyState
            title="Aucune catégorie"
            message="Créez vos premières catégories pour organiser vos transactions"
            actionLabel="Créer une catégorie"
            onAction={handleOpenCreate}
          />
        </ThemedView>
      )}

      <CategoryFormSheet ref={sheetRef} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  pageHeaderText: { flex: 1 },
  pageDate: { marginBottom: 2, textTransform: "capitalize" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  emptyCard: { marginBottom: spacing.md, borderRadius: borderRadius.lg },
});
