import BudgetCard from "@/components/budget/BudgetCard";
import { EmptyState, Screen } from "@/components/layout";
import {
  Button,
  Modal,
  NumberInput,
  Select,
  ThemedText,
  ThemedView,
} from "@/components/ui";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { useFormatCurrency } from "@/services/currency";
import { endOfMonth, startOfMonth, useMonthOptions } from "@/services/date";
import { useAppStore } from "@/store/useAppStore";
import type { Budget, Category } from "@/types";
import NativeSlider from "@react-native-community/slider";
import { useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

export default function BudgetsScreen() {
  const {
    loadInitialData,
    loadBudgets,
    budgetItems,
    categories,
    upsertBudget,
    deleteBudget,
    isLoading,
  } = useAppStore();

  const colors = useTheme();
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const getMonthOptions = useMonthOptions();
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showModal, setShowModal] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);
  const [formData, setFormData] = React.useState({
    categoryId: "",
    amount: 0,
    alertThreshold: 0.8,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const monthStart = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return startOfMonth(new Date(year, month - 1));
  }, [selectedMonth]);

  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);

  // Au focus (et quand le mois change), on recharge toutes les données puis
  // les budgets du mois sélectionné : la période choisie est préservée.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadInitialData();
        await loadBudgets(monthStart.getTime(), monthEnd.getTime());
      })();
    }, [loadInitialData, loadBudgets, monthStart, monthEnd]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await haptics.impact(haptics.ImpactFeedbackStyle.Light);
    await loadBudgets(monthStart.getTime(), monthEnd.getTime());
    setRefreshing(false);
  }, [loadBudgets, monthStart, monthEnd]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" || c.type === "both"),
    [categories],
  );
  const monthOptions = getMonthOptions();

  // Données dérivées : le "spent" est calculé par le store pour la période
  // sélectionnée, donc les écrans ne lisent plus les repositories.
  const budgetsWithProgress = budgetItems.filter((item) => item.category);

  const handleOpenCreate = () => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    setEditingBudget(null);
    setFormData({
      categoryId: expenseCategories[0]?.id || "",
      amount: 0,
      alertThreshold: 0.8,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (item: { budget: Budget; category?: Category | null }) => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    setEditingBudget(item.budget);
    setFormData({
      categoryId: item.budget.categoryId,
      amount: item.budget.amount,
      alertThreshold: item.budget.alertThreshold,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(t("budgets.deleteTitle"), t("budgets.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
          try {
            await deleteBudget(budget.id);
            await haptics.notification(
              haptics.NotificationFeedbackType.Success,
            );
          } catch {
            await haptics.notification(haptics.NotificationFeedbackType.Error);
          }
        },
      },
    ]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId)
      newErrors.category = t("validation.selectCategory");
    if (formData.amount <= 0)
      newErrors.amount = t("validation.amountPositive");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      return;
    }

    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);

    try {
      await upsertBudget({
        categoryId: formData.categoryId,
        amount: formData.amount,
        periodStart: monthStart.getTime(),
        periodEnd: monthEnd.getTime(),
        alertThreshold: formData.alertThreshold,
      });
      await haptics.notification(haptics.NotificationFeedbackType.Success);
      setShowModal(false);
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      setErrors({ submit: t("errors.saveBudget") });
    }
  };

  const totalBudgeted = budgetsWithProgress.reduce(
    (sum, item) => sum + item.budget.amount,
    0,
  );
  const totalSpent = budgetsWithProgress.reduce(
    (sum, item) => sum + item.spent,
    0,
  );
  const remaining = totalBudgeted - totalSpent;
  const selectedMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || "";

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
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <ThemedText
            variant="caption"
            color="tertiary"
            style={styles.pageDate}
          >
            {selectedMonthLabel}
          </ThemedText>
          <ThemedText variant="headline" weight="bold">
            {t("budgets.title")}
          </ThemedText>
        </View>
        <Pressable
          onPress={handleOpenCreate}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t("budgets.create")}
        >
          <Plus size={22} strokeWidth={2.6} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Month selector */}
      <Select
        value={selectedMonth}
        onChange={setSelectedMonth}
        options={monthOptions}
        placeholder={t("common.month")}
        style={styles.monthSelect}
      />

      {/* Summary */}
      <ThemedView
        variant="surface"
        style={[styles.summaryCard, { borderColor: colors.border }]}
      >
        {/* Restant : l'information principale */}
        <View style={styles.summaryHero}>
          <ThemedText variant="caption" color="tertiary">
            {remaining < 0
              ? t("budgets.over")
              : t("budgets.remainingToSpend")}
          </ThemedText>
          <ThemedText
            variant="headline"
            weight="bold"
            color={remaining < 0 ? "error" : "success"}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={styles.tabular}
          >
            {formatCurrency(remaining, { showSign: true })}
          </ThemedText>
        </View>

        {/* Barre de progression globale */}
        <View
          style={[
            styles.summaryTrack,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <View
            style={[
              styles.summaryFill,
              {
                width: `${Math.min(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0, 100)}%`,
                backgroundColor: remaining < 0 ? colors.error : colors.primary,
              },
            ]}
          />
        </View>

        {/* Budget total / Dépensé */}
        <View style={[styles.summaryRow, { borderTopColor: colors.border }]}>
          <View style={styles.summaryCell}>
            <ThemedText variant="caption" color="tertiary">
              {t("budgets.totalBudget")}
            </ThemedText>
            <ThemedText
              variant="body"
              weight="bold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.tabular}
            >
              {formatCurrency(totalBudgeted)}
            </ThemedText>
          </View>

          <View
            style={[styles.summaryDivider, { backgroundColor: colors.border }]}
          />
          <View style={[styles.summaryCell, styles.summaryCellRight]}>
            <ThemedText variant="caption" color="tertiary">
              {t("budgets.spent")}
            </ThemedText>
            <ThemedText
              variant="body"
              weight="bold"
              color="error"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.tabular}
            >
              {formatCurrency(totalSpent)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Budget List */}
      {budgetsWithProgress.length === 0 ? (
        <ThemedView variant="surface" style={styles.emptyCard}>
          <EmptyState
            title={t("budgets.emptyTitle")}
            message={t("budgets.emptyMessage")}
            actionLabel={t("budgets.create")}
            onAction={handleOpenCreate}
          />
        </ThemedView>
      ) : (
        budgetsWithProgress.map(({ budget, category, spent }) => (
          <BudgetCard
            key={budget.id}
            spent={spent}
            budget={budget.amount}
            alertThreshold={budget.alertThreshold}
            categoryName={category!.name}
            categoryColor={category!.color}
            categoryIcon={category!.icon}
            onEdit={() => handleEdit({ budget, category })}
            onDelete={() => handleDelete(budget)}
          />
        ))
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editingBudget ? t("budgets.editTitle") : t("budgets.newTitle")}
        size="md"
      >
        <View className="gap-4">
          <Select
            label={t("common.category")}
            value={formData.categoryId}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, categoryId: value }))
            }
            options={expenseCategories.map((c) => ({
              value: c.id,
              label: c.name,
              color: c.color,
            }))}
            placeholder={t("common.chooseCategory")}
            error={errors.category}
            required
          />

          <NumberInput
            label={t("budgets.monthlyAmount")}
            value={formData.amount}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, amount: value }));
            }}
            placeholder={t("common.amountPlaceholder")}
            error={errors.amount}
            required
            showCurrency
          />

          <View style={styles.thresholdContainer}>
            <ThemedText variant="caption" weight="medium" color="secondary">
              {t("budgets.alertThreshold", {
                percent: Math.round(formData.alertThreshold * 100),
              })}
            </ThemedText>
            <Slider
              value={formData.alertThreshold}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, alertThreshold: value }))
              }
              minimumValue={0.5}
              maximumValue={0.95}
              step={0.05}
            />
          </View>

          {errors.submit && (
            <ThemedText
              variant="caption"
              color="error"
              style={styles.submitError}
            >
              {errors.submit}
            </ThemedText>
          )}

          <View style={styles.actions}>
            <View style={styles.actionCell}>
              <Button
                title={t("common.cancel")}
                onPress={() => setShowModal(false)}
                variant="ghost"
                fullWidth
              />
            </View>
            <View style={styles.actionCell}>
              <Button
                title={editingBudget ? t("common.save") : t("common.create")}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Slider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
}: {
  value: number;
  onValueChange: (v: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
}) {
  const colors = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <NativeSlider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={(v) => onValueChange(Math.round(v * 100) / 100)}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.backgroundTertiary}
        thumbTintColor={colors.primary}
        style={{ height: 40 }}
        accessibilityLabel={t("budgets.alertAt", { percent: 80 })}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemedText variant="caption" color="tertiary">
          {Math.round(minimumValue * 100)}%
        </ThemedText>
        <ThemedText variant="caption" color="tertiary">
          {Math.round(maximumValue * 100)}%
        </ThemedText>
      </View>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  monthSelect: {
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: 20,
    gap: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryHero: {
    gap: 4,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  summaryTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  summaryFill: {
    height: "100%",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryCell: {
    flex: 1,
    gap: 2,
  },
  summaryCellRight: {
    alignItems: "flex-end",
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    marginHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  emptyCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  budgetCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  budgetActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  budgetActionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    gap: spacing.lg,
  },
  thresholdContainer: {
    gap: spacing.sm,
  },
  slider: {
    gap: spacing.sm,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  submitError: {
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  actionCell: {
    flex: 1,
  },
});
