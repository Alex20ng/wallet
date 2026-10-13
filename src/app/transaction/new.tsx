import { PageHeader, Screen } from "@/components/layout";
import { NoIndexHead } from "@/components/seo/public-head";
import {
  Button,
  Input,
  NumberInput,
  Select,
  ThemedText,
  ThemedView,
} from "@/components/ui";
import { borderRadius, shadow, spacing } from "@/constants/theme";
import { useBudgetAlerts } from "@/hooks/alerts/useBudgetAlerts";
import { useCategoryName } from "@/hooks/use-category-name";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { type TransactionType } from "@/services/currency";
import { useAppStore } from "@/store/useAppStore";
import { alert } from "@/utils/alert";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowDownRight, ArrowUpRight, Trash } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DatePicker } from "@/components/forms";

export default function TransactionFormScreen() {
  const { id, type: initialType } = useLocalSearchParams<{
    id?: string;
    type?: string;
  }>();
  const isEditing = Boolean(id);
  const colors = useTheme();
  const { t } = useTranslation();
  const categoryName = useCategoryName();

  const {
    loadCategories,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    monthBudgetItems,
    transactions,
  } = useAppStore();
  const budgetAlerts = useBudgetAlerts();

  const initialTxn = useMemo(
    () => (id ? (transactions.find((t) => t.id === id) ?? null) : null),
    [id, transactions],
  );

  const [type, setType] = React.useState<TransactionType>(
    (initialTxn?.type as TransactionType) ||
      (initialType as TransactionType) ||
      "expense",
  );
  const [amount, setAmount] = React.useState(initialTxn?.amount ?? 0);
  const [categoryId, setCategoryId] = React.useState(
    initialTxn?.categoryId ?? "",
  );
  const [date, setDate] = React.useState(
    initialTxn ? new Date(initialTxn.date) : new Date(),
  );
  const [note, setNote] = React.useState(initialTxn?.note ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" || c.type === "both"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income" || c.type === "both"),
    [categories],
  );
  const availableCategories =
    type === "expense" ? expenseCategories : incomeCategories;
  const activeCategoryId =
    availableCategories.find((c) => c.id === categoryId)?.id ??
    availableCategories[0]?.id ??
    "";

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (amount <= 0) newErrors.amount = t("validation.amountPositive");
    if (!activeCategoryId) newErrors.category = t("validation.selectCategory");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, activeCategoryId, t]);

  const handleSubmit = async () => {
    if (!validate()) {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      return;
    }

    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isEditing && id) {
        await updateTransaction(id, {
          amount,
          type,
          categoryId: activeCategoryId,
          date: date.getTime(),
          note: note || null,
        });
      } else {
        await addTransaction({
          amount,
          type,
          categoryId: activeCategoryId,
          date: date.getTime(),
          note: note || null,
        });
        try {
          const start = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ).getTime();
          const end = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
            23,
            59,
            59,
          ).getTime();
          const cat = categories.find((c) => c.id === activeCategoryId);
          const budget = monthBudgetItems.find(
            (item) => item.budget.categoryId === activeCategoryId,
          )?.budget;
          if (budget && type === "expense") {
            const spentSoFar =
              transactions
                .filter(
                  (t) =>
                    t.categoryId === activeCategoryId &&
                    t.type === "expense" &&
                    t.date >= start &&
                    t.date <= end,
                )
                .reduce((sum, t) => sum + t.amount, 0) + amount;
            await budgetAlerts.checkBudget({
              categoryId: budget.categoryId,
              categoryName: cat ? categoryName(cat) : undefined,
              budget: budget.amount,
              spent: spentSoFar,
              periodStart: start,
              periodEnd: end,
            });
          }
        } catch (error) {
          console.warn("[budget alert]", error);
        }
      }
      await haptics.notification(haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      setErrors({ submit: t("errors.save") });
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;

    alert(t("transaction.deleteTitle"), t("transaction.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
          try {
            await deleteTransaction(id);
            await haptics.notification(
              haptics.NotificationFeedbackType.Success,
            );
            router.back();
          } catch {
            await haptics.notification(haptics.NotificationFeedbackType.Error);
          }
        },
      },
    ]);
  };

  const isExpense = type === "expense";

  return (
    <>
      <NoIndexHead />
      <Screen>
        <PageHeader
          title={
            isEditing ? t("transaction.editTitle") : t("transaction.newTitle")
          }
          subtitle={
            isExpense ? t("transaction.addExpense") : t("transaction.addIncome")
          }
          onBack={() => router.back()}
          rightAction={
            isEditing ? (
              <Pressable
                onPress={() => {
                  haptics.impact(haptics.ImpactFeedbackStyle.Medium);
                  handleDelete();
                }}
                style={[
                  styles.headerAction,
                  { backgroundColor: colors.errorLight },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("transaction.deleteTitle")}
                hitSlop={8}
              >
                <Trash size={18} strokeWidth={2.3} color={colors.error} />
              </Pressable>
            ) : undefined
          }
        />

        <ThemedView variant="surface" style={styles.formCard}>
          {/* Segmented type selector */}
          <View
            style={[
              styles.segmented,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            {(["expense", "income"] as TransactionType[]).map((option) => {
              const active = type === option;
              const activeColor =
                option === "expense" ? colors.error : colors.success;
              const Icon = option === "expense" ? ArrowDownRight : ArrowUpRight;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    haptics.impact(haptics.ImpactFeedbackStyle.Light);
                    setType(option);
                  }}
                  style={[
                    styles.segment,
                    active && {
                      backgroundColor: activeColor,
                      ...shadow(activeColor, {
                        y: 2,
                        blur: 6,
                        opacity: 0.06,
                        elevation: 2,
                      }),
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Icon
                    size={16}
                    strokeWidth={2.6}
                    color={
                      active
                        ? "#FFFFFF"
                        : option === "expense"
                          ? colors.error
                          : colors.success
                    }
                  />
                  <ThemedText
                    variant="body"
                    weight={active ? "bold" : "semibold"}
                    color={
                      active
                        ? "inverse"
                        : option === "expense"
                          ? "error"
                          : "success"
                    }
                  >
                    {option === "expense"
                      ? t("common.expense")
                      : t("common.income")}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Amount Input */}
          <NumberInput
            label={t("common.amount")}
            value={amount}
            onChange={setAmount}
            placeholder={t("common.amountPlaceholder")}
            error={errors.amount}
            required
            showCurrency
            testID="amount-input"
          />

          {/* Category Selector */}
          <Select
            label={t("common.category")}
            value={activeCategoryId}
            onChange={setCategoryId}
            options={availableCategories.map((c) => ({
              value: c.id,
              label: categoryName(c),
              color: c.color,
            }))}
            placeholder={t("common.chooseCategory")}
            error={errors.category}
            required
            testID="category-select"
          />

          {/* Date Picker */}
          <DatePicker
            label={t("common.date")}
            value={date}
            onChange={setDate}
            maxDate={new Date()}
            testID="date-picker"
          />

          {/* Note Input */}
          <Input
            label={t("transaction.noteOptional")}
            value={note}
            onChangeText={setNote}
            placeholder={t("transaction.notePlaceholder")}
            multiline
            numberOfLines={3}
            testID="note-input"
          />

          {errors.submit && (
            <ThemedText
              variant="caption"
              color="error"
              style={styles.submitError}
            >
              {errors.submit}
            </ThemedText>
          )}
        </ThemedView>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={
              isLoading
                ? t("common.saving")
                : isEditing
                  ? t("common.save")
                  : isExpense
                    ? t("transaction.addExpense")
                    : t("transaction.addIncome")
            }
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />
          {isEditing && (
            <Button
              title={t("common.delete")}
              onPress={handleDelete}
              variant="danger"
              size="md"
              fullWidth
            />
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    gap: spacing.sm,
  },
  submitError: {
    textAlign: "center",
  },
});
