import { EmptyState, Screen, TransactionItem } from "@/components/layout";
import { Modal, Select, ThemedText, ThemedView } from "@/components/ui";
import FloatingActionButton from "@/components/ui/floatingActionButton";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { categoryRepository } from "@/repositories";
import { getPeriodPresets, type PeriodPreset } from "@/services/currency";
import { useAppStore } from "@/store/useAppStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { ListFilter, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

const SHORT_PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Jour",
  week: "Semaine",
  month: "Mois",
  year: "Année",
  custom: "Perso",
};

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
  const [showFilters, setShowFilters] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
    { value: "all", label: "Toutes" },
    { value: "expense", label: "Dépenses" },
    { value: "income", label: "Revenus" },
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
            {transactions.length} opération{transactions.length > 1 ? "s" : ""}
          </ThemedText>
          <ThemedText variant="headline" weight="bold">
            Transactions
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
            hasActiveFilters ? "Effacer les filtres" : "Ouvrir les filtres"
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
                {SHORT_PERIOD_LABELS[preset.value]}
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
              label={filterType === "expense" ? "Dépenses" : "Revenus"}
              onRemove={() => {
                haptics.impact(haptics.ImpactFeedbackStyle.Light);
                setFilterType("all");
              }}
            />
          )}
          {selectedCategoryIds.map((id) => {
            const cat = categoryRepository.getById(id);
            return cat ? (
              <FilterChip
                key={id}
                label={cat.name}
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
        title="Filtres"
      >
        <View style={styles.filterContent}>
          <ThemedText
            variant="caption"
            weight="bold"
            color="tertiary"
            style={styles.filterSectionTitle}
          >
            TYPE
          </ThemedText>
          <Select
            value={filterType}
            onChange={(value: string) =>
              setFilterType(value as "all" | "expense" | "income")
            }
            options={filterOptions}
            placeholder="Tous les types"
          />

          <ThemedText
            variant="caption"
            weight="bold"
            color="tertiary"
            style={styles.filterSectionTitle}
          >
            CATÉGORIES DÉPENSES
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
            CATÉGORIES REVENUS
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
            title="Aucune transaction"
            message={
              hasActiveFilters
                ? "Aucune transaction ne correspond à vos filtres"
                : "Commencez par ajouter une transaction"
            }
            actionLabel={
              hasActiveFilters
                ? "Effacer les filtres"
                : "Ajouter une transaction"
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
        accessibilityLabel={`Retirer ${label}`}
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
  categories: { id: string; name: string; color: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const colors = useTheme();
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
              {cat.name}
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
