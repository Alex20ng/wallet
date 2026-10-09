import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowDownRight, ArrowUpRight, Trash } from 'lucide-react-native';
import { haptics } from '@/hooks/use-haptics';
import { ThemedView, ThemedText, Button, Input, Select, NumberInput } from '@/components/ui';
import { Screen, PageHeader } from '@/components/layout';
import { useAppStore } from '@/store/useAppStore';
import { useBudgetAlerts } from '@/hooks/alerts/useBudgetAlerts';
import { transactionRepository } from '@/repositories';
import { type TransactionType } from '@/services/currency';
import { spacing, borderRadius, shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { DatePicker } from '@/components/forms';

export default function TransactionFormScreen() {
  const { id, type: initialType } = useLocalSearchParams<{ id?: string; type?: string }>();
  const isEditing = Boolean(id);
  const colors = useTheme();

  const {
    loadCategories,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
  } = useAppStore();

  const initialTxn = useMemo(
    () => (id ? transactionRepository.getById(id) : null),
    [id],
  );

  const [type, setType] = React.useState<TransactionType>(
    (initialTxn?.type as TransactionType) || (initialType as TransactionType) || 'expense',
  );
  const [amount, setAmount] = React.useState(initialTxn?.amount ?? 0);
  const [categoryId, setCategoryId] = React.useState(initialTxn?.categoryId ?? '');
  const [date, setDate] = React.useState(initialTxn ? new Date(initialTxn.date) : new Date());
  const [note, setNote] = React.useState(initialTxn?.note ?? '');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const expenseCategories = useMemo(
    () => categories.filter(c => c.type === 'expense' || c.type === 'both'),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter(c => c.type === 'income' || c.type === 'both'),
    [categories]
  );
  const availableCategories = type === 'expense' ? expenseCategories : incomeCategories;
  const activeCategoryId =
    availableCategories.find(c => c.id === categoryId)?.id ?? availableCategories[0]?.id ?? '';

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (amount <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
    if (!activeCategoryId) newErrors.category = 'Sélectionnez une catégorie';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, activeCategoryId]);

  const handleSubmit = async () => {
    if (!validate()) {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      return;
    }

    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isEditing && id) {
        await updateTransaction(id, { amount, type, categoryId: activeCategoryId, date: date.getTime(), note: note || null });
      } else {
        await addTransaction({ amount, type, categoryId: activeCategoryId, date: date.getTime(), note: note || null });
        try {
          const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
          const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).getTime();
          const cat = categories.find((c) => c.id === activeCategoryId);
          const bgs = (useAppStore() as any).budgets || [];
          const budget = bgs.find((b: any) => b.categoryId === activeCategoryId && b.periodStart === start);
          if (budget && type === 'expense') {
            await (useBudgetAlerts() as any).checkBudget({
              categoryId: budget.categoryId,
              categoryName: cat?.name,
              budget: budget.amount,
              spent: 0,
              periodStart: start,
              periodEnd: end,
            });
          }
        } catch {}
      }
      await haptics.notification(haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;

    Alert.alert(
      'Supprimer la transaction',
      'Cette action est irréversible. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteTransaction(id);
              await haptics.notification(haptics.NotificationFeedbackType.Success);
              router.back();
            } catch {
              await haptics.notification(haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const isExpense = type === 'expense';

  return (
    <Screen>
      <PageHeader
        title={isEditing ? 'Modifier' : 'Nouvelle transaction'}
        subtitle={isExpense ? 'Ajouter une dépense' : 'Ajouter un revenu'}
        onBack={() => router.back()}
        rightAction={
          isEditing ? (
            <Pressable
              onPress={() => {
                haptics.impact(haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Supprimer la transaction',
                  'Cette action est irréversible. Voulez-vous continuer ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
                  ],
                );
              }}
              style={[styles.headerAction, { backgroundColor: colors.errorLight }]}
              accessibilityRole="button"
              accessibilityLabel="Supprimer la transaction"
              hitSlop={8}
            >
              <Trash size={18} strokeWidth={2.3} color={colors.error} />
            </Pressable>
          ) : undefined
        }
      />

      <ThemedView variant="surface" style={styles.formCard}>
        {/* Segmented type selector */}
        <View style={[styles.segmented, { backgroundColor: colors.backgroundSecondary }]}>
          {(['expense', 'income'] as TransactionType[]).map(t => {
            const active = type === t;
            const activeColor = t === 'expense' ? colors.error : colors.success;
            const Icon = t === 'expense' ? ArrowDownRight : ArrowUpRight;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  haptics.impact(haptics.ImpactFeedbackStyle.Light);
                  setType(t);
                }}
                style={[
                  styles.segment,
                  active && { backgroundColor: activeColor, ...shadows.sm, shadowColor: activeColor },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Icon
                  size={16}
                  strokeWidth={2.6}
                  color={active ? '#FFFFFF' : t === 'expense' ? colors.error : colors.success}
                />
                <ThemedText
                  variant="body"
                  weight={active ? 'bold' : 'semibold'}
                  color={active ? 'inverse' : t === 'expense' ? 'error' : 'success'}
                >
                  {t === 'expense' ? 'Dépense' : 'Revenu'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Amount Input */}
        <NumberInput
          label="Montant"
          value={amount}
          onChange={setAmount}
          placeholder="0,00"
          error={errors.amount}
          required
          showCurrency
          testID="amount-input"
        />

        {/* Category Selector */}
        <Select
          label="Catégorie"
          value={activeCategoryId}
          onChange={setCategoryId}
          options={availableCategories.map(c => ({
            value: c.id,
            label: c.name,
            color: c.color,
          }))}
          placeholder="Choisir une catégorie"
          error={errors.category}
          required
          testID="category-select"
        />

        {/* Date Picker */}
        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          maxDate={new Date()}
          testID="date-picker"
        />

        {/* Note Input */}
        <Input
          label="Note (optionnel)"
          value={note}
          onChangeText={setNote}
          placeholder="Ajouter une note..."
          multiline
          numberOfLines={3}
          testID="note-input"
        />

        {errors.submit && (
          <ThemedText variant="caption" color="error" style={styles.submitError}>
            {errors.submit}
          </ThemedText>
        )}
      </ThemedView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={isLoading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : isExpense ? 'Ajouter la dépense' : 'Ajouter le revenu'}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        />
        {isEditing && (
          <Button
            title="Supprimer"
            onPress={handleDelete}
            variant="danger"
            size="md"
            fullWidth
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  submitError: {
    textAlign: 'center',
  },
});
