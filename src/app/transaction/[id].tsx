import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Calendar, Tag, FileText, Clock } from 'lucide-react-native';
import { haptics } from '@/hooks/use-haptics';
import { ThemedView, ThemedText, Button, Modal } from '@/components/ui';
import { Screen, PageHeader } from '@/components/layout';
import { useAppStore } from '@/store/useAppStore';
import { categoryRepository, transactionRepository } from '@/repositories';
import { formatCurrency, formatDate } from '@/services/currency';
import { getCategoryIcon } from '@/constants/category-icons';
import { spacing, borderRadius, shadows, gradients } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useTheme();

  const { deleteTransaction } = useAppStore();

  const transaction = useMemo(() => {
    if (!id) return null;
    return transactionRepository.getById(id);
  }, [id]);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  useEffect(() => {
    if (id && !transaction) {
      router.back();
    }
  }, [id, transaction]);

  const handleDelete = async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
    try {
      await deleteTransaction(id!);
      await haptics.notification(haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
    }
  };

  if (!transaction) {
    return (
      <Screen safeAreaEdges={['top', 'bottom']}>
        <PageHeader title="Transaction" onBack={() => router.back()} />
        <ThemedText variant="body" color="tertiary" style={styles.loading}>Chargement...</ThemedText>
      </Screen>
    );
  }

  const isExpense = transaction.type === 'expense';
  const category = categoryRepository.getById(transaction.categoryId);

  const handleEdit = () => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    router.push(`/transaction/new?id=${id}`);
  };

  return (
    <Screen>
      <PageHeader
        title="Transaction"
        subtitle={isExpense ? 'Dépense' : 'Revenu'}
        onBack={() => router.back()}
        rightAction={
          <Pressable
            onPress={handleEdit}
            style={[styles.headerAction, { backgroundColor: colors.primaryLight }]}
            accessibilityRole="button"
            accessibilityLabel="Modifier la transaction"
            hitSlop={8}
          >
            <Pencil size={18} strokeWidth={2.3} color={colors.primary} />
          </Pressable>
        }
      />

      {/* Amount hero */}
      <LinearGradient
        colors={[...(isExpense ? gradients.danger : gradients.success)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <ThemedText variant="caption" weight="bold" style={styles.heroBadgeText}>
            {isExpense ? 'DÉPENSE' : 'REVENU'}
          </ThemedText>
        </View>
        <ThemedText style={styles.heroAmount}>
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </ThemedText>
        <HeroCategoryPill icon={category?.icon} name={category?.name || 'Catégorie inconnue'} />
      </LinearGradient>

      {/* Details */}
      <ThemedView variant="surface" style={styles.detailsCard}>
        <DetailRow
          icon={<Calendar size={17} strokeWidth={2.3} color={colors.primary} />}
          label="Date"
          value={formatDate(transaction.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        />
        {transaction.note ? (
          <DetailRow
            icon={<FileText size={17} strokeWidth={2.3} color={colors.primary} />}
            label="Note"
            value={transaction.note}
          />
        ) : null}
        <DetailRow
          icon={<Tag size={17} strokeWidth={2.3} color={colors.primary} />}
          label="Catégorie"
          value={category ? `${category.name} · ${category.type === 'income' ? 'Revenu' : category.type === 'both' ? 'Dépense & revenu' : 'Dépense'}` : 'Inconnue'}
        />
        <DetailRow
          icon={<Clock size={17} strokeWidth={2.3} color={colors.primary} />}
          label="Créée le"
          value={formatDate(transaction.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          isLast={transaction.updatedAt === transaction.createdAt}
        />
        {transaction.updatedAt !== transaction.createdAt && (
          <DetailRow
            icon={<Clock size={17} strokeWidth={2.3} color={colors.warning} />}
            label="Modifiée le"
            value={formatDate(transaction.updatedAt, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            isLast
          />
        )}
      </ThemedView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Modifier"
          onPress={handleEdit}
          variant="outline"
          size="md"
          fullWidth
        />
        <Button
          title="Supprimer"
          onPress={() => setShowDeleteConfirm(true)}
          variant="danger"
          size="md"
          fullWidth
        />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Supprimer la transaction"
        size="sm"
      >
        <ThemedText variant="body" color="secondary" style={styles.modalText}>
          Cette action est irréversible. La transaction sera supprimée définitivement.
        </ThemedText>
        <View style={styles.modalActions}>
          <Button
            title="Annuler"
            onPress={() => setShowDeleteConfirm(false)}
            variant="ghost"
            size="md"
            fullWidth
          />
          <Button
            title="Supprimer"
            onPress={handleDelete}
            variant="danger"
            size="md"
            fullWidth
          />
        </View>
      </Modal>
    </Screen>
  );
}

function HeroCategoryPill({ icon, name }: { icon?: string; name: string }) {
  return (
    <View style={styles.heroCategoryRow}>
      <View style={styles.heroCategoryIcon}>
        {React.createElement(getCategoryIcon(icon), {
          size: 16,
          strokeWidth: 2.4,
          color: '#FFFFFF',
        })}
      </View>
      <ThemedText style={styles.heroCategoryName}>{name}</ThemedText>
    </View>
  );
}

function DetailRow({ icon, label, value, isLast }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const colors = useTheme();
  return (
    <View style={[styles.detailRow, !isLast && { borderBottomColor: colors.border }]}>
      <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
        {icon}
      </View>
      <View style={styles.detailText}>
        <ThemedText variant="caption" color="tertiary">{label}</ThemedText>
        <ThemedText variant="body" weight="semibold" color="primary" numberOfLines={2}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
    overflow: 'hidden',
  },
  heroBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  heroCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  heroCategoryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCategoryName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  detailsCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    gap: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
