import { EmptyState, Screen, TransactionItem } from "@/components/layout";
import { Modal, Select, ThemedText, ThemedView } from "@/components/ui";
import FloatingActionButton from "@/components/ui/floatingActionButton";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { useCategoryName } from "@/hooks/use-category-name";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { usePeriodPresets, usePeriodShortLabel } from "@/services/currency";
import { useAppStore } from "@/store/useAppStore";
import type { Category } from "@/types";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { ListFilter, X } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

export default function TransactionsScreen() {
  const {
    loadInitialData,
    loadTransactions,
    transactions,
    categories,
    selectedPeriod,
    filterType,
    selectedCategoryIds,
    setPeriod,
    setFilterType,
    toggleCategoryFilter,
    clearCategoryFilters,
  } = useAppStore();

  const colors = useTheme();
  const { t, tp } = useTranslation();
  const categoryName = useCategoryName();
  const getPeriodPresets = usePeriodPresets();
  const getPeriodShortLabel = usePeriodShortLabel();
  const [showFilters, setShowFilters] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" || c.type === "both"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income" || c.type === "both"),
    [categories],
  );

  const filterOptions = [
    { value: "all", label: t("transactions.filterAll") },
    { value: "expense", label: t("common.expenses") },
    { value: "income", label: t("common.incomes") },
  ];

  const hasActiveFilters =
    filterType !== "all" || selectedCategoryIds.length > 0;
  const periodPresets = getPeriodPresets().filter((p) => p.value !== "custom");

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
      {/* Page title */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <ThemedText
            variant="caption"
            color="tertiary"
            style={styles.pageDate}
          >
            {tp("transactions.count", transactions.length)}
          </ThemedText>
          <ThemedText variant="headline" weight="bold">
            {t("transactions.title")}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => {
            haptics.impact(haptics.ImpactFeedbackStyle.Light);
            if (hasActiveFilters) {
              clearCategoryFilters();
              setFilterType("all");
            } else {
              setShowFilters(true);
            }
          }}
          style={[
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            hasActiveFilters && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            hasActiveFilters
              ? t("transactions.clearFilters")
              : t("transactions.openFilters")
          }
        >
          <ListFilter
            size={18}
            strokeWidth={2.3}
            color={hasActiveFilters ? "#FFFFFF" : colors.textPrimary}
          />
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <ThemedText
                variant="overline"
                color="inverse"
                style={styles.filterBadgeText}
              >
                {(filterType !== "all" ? 1 : 0) + selectedCategoryIds.length}
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {periodPresets.map((preset) => {
          const active = selectedPeriod === preset.value;
          return (
            <Pressable
              key={preset.value}
              onPress={() => {
                haptics.impact(haptics.ImpactFeedbackStyle.Light);
                setPeriod(preset.value);
              }}
              style={[
                styles.periodButton,
                active && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <ThemedText
                variant="caption"
                weight={active ? "bold" : "medium"}
                color={active ? "inverse" : "secondary"}
              >
                {getPeriodShortLabel(preset.value)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          {filterType !== "all" && (
            <FilterChip
              label={
                filterType === "expense"
                  ? t("common.expenses")
                  : t("common.incomes")
              }
              onRemove={() => {
                haptics.impact(haptics.ImpactFeedbackStyle.Light);
                setFilterType("all");
              }}
            />
          )}
          {selectedCategoryIds.map((id) => {
            const cat = categories.find((c) => c.id === id);
            return cat ? (
              <FilterChip
                key={id}
                label={categoryName(cat)}
                color={cat.color}
                onRemove={() => {
                  haptics.impact(haptics.ImpactFeedbackStyle.Light);
                  toggleCategoryFilter(id);
                }}
              />
            ) : null;
          })}
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        size="lg"
        title={t("transactions.filters")}
      >
        <View style={styles.filterContent}>
          <ThemedText
            variant="caption"
            weight="bold"
            color="tertiary"
            style={styles.filterSectionTitle}
          >
            {t("transactions.filterTypeLabel")}
          </ThemedText>
          <Select
            value={filterType}
            onChange={(value: string) =>
              setFilterType(value as "all" | "expense" | "income")
            }
            options={filterOptions}
            placeholder={t("transactions.allTypes")}
          />

          <ThemedText
            variant="caption"
            weight="bold"
            color="tertiary"
            style={styles.filterSectionTitle}
          >
            {t("transactions.expenseCategories")}
          </ThemedText>
          <CategoryFilterChips
            categories={expenseCategories}
            selectedIds={selectedCategoryIds}
            onToggle={toggleCategoryFilter}
          />

          <ThemedText
            variant="caption"
            weight="bold"
            color="tertiary"
            style={styles.filterSectionTitle}
          >
            {t("transactions.incomeCategories")}
          </ThemedText>
          <CategoryFilterChips
            categories={incomeCategories}
            selectedIds={selectedCategoryIds}
            onToggle={toggleCategoryFilter}
          />
        </View>
      </Modal>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <ThemedView variant="surface" style={styles.emptyCard}>
          <EmptyState
            title={t("transactions.emptyTitle")}
            message={
              hasActiveFilters
                ? t("transactions.noMatchFilters")
                : t("transactions.emptyMessage")
            }
            actionLabel={
              hasActiveFilters
                ? t("transactions.clearFilters")
                : t("transactions.addTransaction")
            }
            onAction={
              hasActiveFilters
                ? () => {
                    clearCategoryFilters();
                    setFilterType("all");
                  }
                : () => router.push("/transaction/new?type=expense")
            }
          />
        </ThemedView>
      ) : (
        <View
          style={[
            styles.listCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <FlashList
            data={transactions}
            renderItem={({ item }) => (
              <TransactionItem
                transaction={item}
                onPress={() => router.push(`/transaction/${item.id}`)}
              />
            )}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={() => <View style={styles.listPaddingTop} />}
            ListFooterComponent={() => (
              <View style={styles.listPaddingBottom} />
            )}
            refreshing={refreshing}
            onRefresh={onRefresh}
            drawDistance={240}
          />
        </View>
      )}

      <FloatingActionButton />
    </Screen>
  );
}

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  const themeColors = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={[
        styles.filterChip,
        {
          backgroundColor: color
            ? color + "1A"
            : themeColors.backgroundSecondary,
          borderColor: color || themeColors.border,
        },
      ]}
    >
      <ThemedText variant="caption" weight="semibold" color="primary">
        {label}
      </ThemedText>
      <Pressable
        onPress={onRemove}
        style={styles.filterChipRemove}
        accessibilityLabel={t("common.removeLabel", { label })}
        hitSlop={6}
      >
        <X
          size={13}
          strokeWidth={2.6}
          color={color || themeColors.textTertiary}
        />
      </Pressable>
    </View>
  );
}

function CategoryFilterChips({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: Pick<Category, "id" | "name" | "color" | "isDefault">[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const colors = useTheme();
  const categoryName = useCategoryName();
  return (
    <View style={styles.chipContainer}>
      {categories.map((cat) => {
        const selected = selectedIds.includes(cat.id);
        return (
          <Pressable
            key={cat.id}
            onPress={() => onToggle(cat.id)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selected ? cat.color : cat.color + "14",
                borderColor: selected ? cat.color : cat.color + "59",
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <ThemedText
              variant="caption"
              weight={selected ? "bold" : "medium"}
              color={selected ? "inverse" : "primary"}
            >
              {categoryName(cat)}
            </ThemedText>
          </Pressable>
        );
      })}
      <View
        style={{
          width: 0,
          height: 0,
          opacity: 0,
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  pageHeaderText: {
    flex: 1,
  },
  pageDate: {
    marginBottom: 2,
    textTransform: "capitalize",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#F43F5E",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    letterSpacing: 0,
  },
  periodRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: "transparent",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterContent: {
    gap: spacing.xs,
  },
  filterSectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipRemove: {
    padding: 2,
  },
  emptyCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  listCard: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md + 46 + spacing.md,
  },
  listPaddingTop: { height: spacing.xs },
  listPaddingBottom: { height: spacing.xxl + spacing.xl },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.md,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  fabContent: {
    width: 58,
    height: 58,
    borderRadius: 29,

    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    // Effet d'enfoncement type Flutter au press
    transform: [{ scale: 0.95 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 6, // Augmente l'ombre sur Android comme le Material FAB
      },
    }),
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Assure le parfait arrondi du gradient
  },
});
