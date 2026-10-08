import {
  BudgetProgress,
  CategoryPieChart,
  TrendChart,
} from "@/components/charts";
import { EmptyState, Screen, TransactionItem } from "@/components/layout";
import { ThemedText, ThemedView } from "@/components/ui";
import { borderRadius, gradients, shadows, spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/repositories";
import {
  formatCurrency,
  formatDate,
  getPeriodPresets,
  type PeriodPreset,
} from "@/services/currency";
import { endOfMonth, startOfMonth } from "@/services/date";
import { useAppStore } from "@/store/useAppStore";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  PiggyBank,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";

const SHORT_PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Jour",
  week: "Semaine",
  month: "Mois",
  year: "Année",
  custom: "Perso",
};

export default function DashboardScreen() {
  const {
    loadInitialData,
    loadDashboardStats,
    loadTransactions,
    loadBudgets,
    dashboardStats,
    transactions,
    currentPeriodRange,
    selectedPeriod,
    setPeriod,
    isLoading,
  } = useAppStore();

  const colors = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        pageHeader: {
          marginBottom: spacing.md,
        },
        pageTitle: {
          marginBottom: 2,
        },
        hero: {
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          paddingBottom: spacing.lg - spacing.xs,
          marginBottom: spacing.md,
          ...shadows.lg,
          shadowColor: "#059669",
          overflow: "hidden",
        },
        heroTopRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.sm,
        },
        heroLabel: {
          color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: 11,
          fontWeight: "600",
        },
        balanceAmount: {
          color: "#FFFFFF",
          fontSize: 40,
          lineHeight: 46,
          fontWeight: "700",
          letterSpacing: -1.2,
          textAlign: "center",
          marginBottom: spacing.lg,
          fontVariant: ["tabular-nums"],
        },
        heroStatsRow: {
          flexDirection: "row",
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        heroStat: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          backgroundColor: "rgba(255,255,255,0.14)",
          borderRadius: borderRadius.lg,
          padding: spacing.sm + 2,
        },
        heroStatIcon: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.18)",
        },
        heroStatText: {
          flex: 1,
        },
        heroStatLabel: {
          color: "rgba(255,255,255,0.7)",
          fontSize: 11,
          marginBottom: 1,
        },
        heroStatValue: {
          color: "#FFFFFF",
          fontSize: 14.5,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        },
        periodRow: {
          flexDirection: "row",
          gap: spacing.xs,
          backgroundColor: "rgba(255,255,255,0.12)",
          borderRadius: borderRadius.full,
          padding: 3,
        },
        periodButton: {
          flex: 1,
          paddingVertical: spacing.xs + 2,
          borderRadius: borderRadius.full,
          alignItems: "center",
          justifyContent: "center",
        },
        periodButtonActive: {
          backgroundColor: "#FFFFFF",
          ...shadows.xs,
          shadowOpacity: 0.2,
        },
        periodButtonText: {
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          fontWeight: "600",
        },
        periodButtonTextActive: {
          color: "#059669",
        },
        quickActions: {
          flexDirection: "row",
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        sectionCard: {
          marginBottom: spacing.md,
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
        },
        sectionTitle: {
          flexShrink: 1,
        },
        seeAll: {
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.xs,
        },
        pieCenter: {
          alignItems: "center",
          gap: 2,
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
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        separator: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginLeft: spacing.md + 46 + spacing.md,
        },
        listPaddingTop: { height: spacing.xs },
        listPaddingBottom: { height: spacing.md },
        chartCard: {
          marginBottom: spacing.md,
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chartTitle: {
          marginBottom: spacing.xs,
        },
        chartSubtitle: {
          marginBottom: spacing.md,
        },
      }),
    [colors],
  );

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    await Promise.all([
      loadDashboardStats(),
      loadTransactions(),
      loadBudgets(),
    ]);
    setRefreshing(false);
  }, [loadDashboardStats, loadTransactions, loadBudgets]);

  const handlePeriodChange = (preset: PeriodPreset) => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    setPeriod(preset);
  };

  const periodPresets = getPeriodPresets().filter((p) => p.value !== "custom");

  if (isLoading && !dashboardStats) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color="tertiary">
            Chargement...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const totalIncome = dashboardStats?.totalIncome || 0;
  const totalExpense = dashboardStats?.totalExpense || 0;
  const balance = dashboardStats?.balance || 0;

  const pieChartData = (dashboardStats?.expenseByCategory || []).map((c) => ({
    name: c.categoryName,
    value: c.amount,
    color: c.categoryColor,
  }));

  const trendData = (dashboardStats?.dailyTrend || []).map((d) => ({
    label: d.date,
    income: d.income,
    expense: d.expense,
    date: d.date,
  }));

  const currentMonthStart = startOfMonth(new Date(currentPeriodRange.start));
  const currentMonthEnd = endOfMonth(new Date(currentPeriodRange.end));
  const monthlyBudgets = budgetRepository.getAll(
    currentMonthStart.getTime(),
    currentMonthEnd.getTime(),
  );

  const budgetItems = monthlyBudgets.map((budget) => {
    const category = categoryRepository.getById(budget.categoryId);
    const spent = transactionRepository
      .getAll({
        startDate: currentMonthStart.getTime(),
        endDate: currentMonthEnd.getTime(),
        type: "expense",
        categoryIds: [budget.categoryId],
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return { budget, category, spent };
  });

  const recentTransactions = transactions.slice(0, 5);
  const today = new Date();
  const periodLabel =
    getPeriodPresets().find((p) => p.value === selectedPeriod)?.label || "";

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
        <ThemedText variant="caption" color="tertiary" style={styles.pageTitle}>
          {formatDate(today, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </ThemedText>
        <ThemedText variant="headline" weight="bold">
          Tableau de bord
        </ThemedText>
      </View>

      {/* Balance hero */}
      <LinearGradient
        colors={[...gradients.brandDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTopRow}>
          <ThemedText style={styles.heroLabel}>
            Solde · {periodLabel}
          </ThemedText>
        </View>

        <ThemedText style={styles.balanceAmount}>
          {formatCurrency(balance, { showSign: true })}
        </ThemedText>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <View style={styles.heroStatIcon}>
              <ArrowUpRight size={17} strokeWidth={2.6} color="#A7F3D0" />
            </View>
            <View style={styles.heroStatText}>
              <ThemedText style={styles.heroStatLabel}>Revenus</ThemedText>
              <ThemedText style={styles.heroStatValue}>
                +{formatCurrency(totalIncome)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroStat}>
            <View style={styles.heroStatIcon}>
              <ArrowDownRight size={17} strokeWidth={2.6} color="#FECDD3" />
            </View>
            <View style={styles.heroStatText}>
              <ThemedText style={styles.heroStatLabel}>Dépenses</ThemedText>
              <ThemedText style={styles.heroStatValue}>
                -{formatCurrency(totalExpense)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.periodRow}>
          {periodPresets.map((preset) => {
            const active = selectedPeriod === preset.value;
            return (
              <Pressable
                key={preset.value}
                onPress={() => handlePeriodChange(preset.value)}
                style={[
                  styles.periodButton,
                  active && styles.periodButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <ThemedText
                  style={[
                    styles.periodButtonText,
                    active && styles.periodButtonTextActive,
                  ]}
                >
                  {SHORT_PERIOD_LABELS[preset.value]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <QuickAction
          label="Dépense"
          icon={
            <ArrowDownRight size={20} strokeWidth={2.4} color={colors.error} />
          }
          iconBackground={colors.errorLight}
          onPress={() => router.push("/transaction/new?type=expense")}
        />
        <QuickAction
          label="Revenu"
          icon={
            <ArrowUpRight size={20} strokeWidth={2.4} color={colors.success} />
          }
          iconBackground={colors.successLight}
          onPress={() => router.push("/transaction/new?type=income")}
        />
        <QuickAction
          label="Budget"
          icon={
            <PiggyBank size={20} strokeWidth={2.4} color={colors.primary} />
          }
          iconBackground={colors.primaryLight}
          onPress={() => router.push("/(tabs)/budgets")}
        />
      </View>

      {/* Répartition */}
      <ThemedView variant="surface" style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <ThemedText
            variant="subtitle"
            weight="bold"
            style={styles.sectionTitle}
          >
            Dépenses par catégorie
          </ThemedText>
        </View>
        <CategoryPieChart
          data={pieChartData}
          size={170}
          showLegend={pieChartData.length > 0}
          centerContent={
            <View style={styles.pieCenter}>
              <ThemedText variant="caption" color="tertiary">
                Total
              </ThemedText>
              <ThemedText variant="body" weight="bold" color="primary">
                {formatCurrency(totalExpense)}
              </ThemedText>
            </View>
          }
        />
      </ThemedView>

      {/* Évolution */}
      <ThemedView variant="surface" style={styles.chartCard}>
        <ThemedText variant="subtitle" weight="bold" style={styles.chartTitle}>
          Évolution
        </ThemedText>
        <ThemedText
          variant="caption"
          color="tertiary"
          style={styles.chartSubtitle}
        >
          Revenus et dépenses de la période
        </ThemedText>
        <TrendChart data={trendData} height={170} />
      </ThemedView>

      {/* Budget Progress */}
      {budgetItems.length > 0 && (
        <ThemedView variant="surface" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText
              variant="subtitle"
              weight="bold"
              style={styles.sectionTitle}
            >
              Budgets du mois
            </ThemedText>
            <Pressable
              onPress={() => router.push("/(tabs)/budgets")}
              style={styles.seeAll}
              accessibilityRole="button"
              accessibilityLabel="Voir tous les budgets"
            >
              <ThemedText variant="caption" weight="semibold" color="link">
                Voir tout
              </ThemedText>
              <ChevronRight
                size={14}
                strokeWidth={2.4}
                color={colors.primary}
              />
            </Pressable>
          </View>
          {budgetItems
            .slice(0, 3)
            .map(({ budget, category, spent }) =>
              category ? (
                <BudgetProgress
                  key={budget.id}
                  spent={spent}
                  budget={budget.amount}
                  categoryName={category.name}
                  categoryColor={category.color}
                />
              ) : null,
            )}
        </ThemedView>
      )}

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <ThemedText variant="subtitle" weight="bold">
          Transactions récentes
        </ThemedText>
        <Pressable
          onPress={() => router.push("/(tabs)/transactions")}
          style={styles.seeAll}
          accessibilityRole="button"
          accessibilityLabel="Voir toutes les transactions"
        >
          <ThemedText variant="caption" weight="semibold" color="link">
            Voir tout
          </ThemedText>
          <ChevronRight size={14} strokeWidth={2.4} color={colors.primary} />
        </Pressable>
      </View>

      {recentTransactions.length === 0 ? (
        <ThemedView variant="surface" style={styles.emptyCard}>
          <EmptyState
            title="Aucune transaction"
            message="Commencez par ajouter votre première dépense ou revenu"
            actionLabel="Ajouter une transaction"
            onAction={() => router.push("/transaction/new?type=expense")}
          />
        </ThemedView>
      ) : (
        <View style={styles.listCard}>
          <FlashList
            data={recentTransactions}
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
            drawDistance={200}
          />
        </View>
      )}
    </Screen>
  );
}

function QuickAction({
  label,
  icon,
  iconBackground,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  iconBackground: string;
  onPress: () => void;
}) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={() => {
        haptics.impact(haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingVertical: spacing.md,
          alignItems: "center",
          gap: spacing.xs + 2,
          ...shadows.xs,
        },
        pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconBackground,
        }}
      >
        {icon}
      </View>
      <ThemedText variant="caption" weight="semibold" color="secondary">
        {label}
      </ThemedText>
    </Pressable>
  );
}
