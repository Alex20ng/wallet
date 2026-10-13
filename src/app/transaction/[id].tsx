import { PageHeader, Screen } from "@/components/layout";
import { NoIndexHead } from "@/components/seo/public-head";
import { Button, ThemedText, ThemedView } from "@/components/ui";
import { getCategoryIcon } from "@/constants/category-icons";
import { borderRadius, gradients, shadows, spacing } from "@/constants/theme";
import { useCategoryName } from "@/hooks/use-category-name";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { useFormatCurrency, useFormatDate } from "@/services/currency";
import { useAppStore } from "@/store/useAppStore";
import { alert } from "@/utils/alert";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, Clock, FileText, Pencil, Tag } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useTheme();
  const { t } = useTranslation();
  const categoryName = useCategoryName();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();

  const { deleteTransaction, transactions, categories, initialized } =
    useAppStore();

  const transaction = useMemo(() => {
    if (!id) return null;
    return transactions.find((t) => t.id === id) ?? null;
  }, [id, transactions]);

  // Redirige uniquement quand les données sont chargées : après une
  // suppression, le store rafraîchit `transactions` et cet effet fait le retour.
  useEffect(() => {
    if (initialized && id && !transaction) {
      router.back();
    }
  }, [initialized, id, transaction]);

  const handleDelete = async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
    try {
      await deleteTransaction(id!);
      await haptics.notification(haptics.NotificationFeedbackType.Success);
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
    }
  };

  // Alerte système : Liquid Glass sur iOS 26, boîte de dialogue Material sur Android
  const confirmDelete = () => {
    alert(
      t("transaction.deleteTitle"),
      t("transaction.deleteMessageDetail"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: handleDelete,
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    if (initialized && id && !transaction) {
      if (router.canGoBack()) router.back();
      else router.replace("/transactions");
    }
  }, [initialized, id, transaction]);

  if (!transaction) {
    return (
      <Screen safeAreaEdges={["top", "bottom"]}>
        <NoIndexHead />
        <PageHeader
          title={t("transaction.title")}
          onBack={() => router.back()}
        />
        <ThemedText variant="body" color="tertiary" style={styles.loading}>
          {t("common.loading")}
        </ThemedText>
      </Screen>
    );
  }

  const isExpense = transaction.type === "expense";
  const category =
    categories.find((c) => c.id === transaction.categoryId) ?? null;

  const handleEdit = () => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    router.push(`/transaction/new?id=${id}`);
  };

  return (
    <>
      <NoIndexHead />
      <Screen>
        <PageHeader
          title={t("transaction.title")}
          subtitle={isExpense ? t("common.expense") : t("common.income")}
          onBack={() => router.back()}
          rightAction={
            <Pressable
              onPress={handleEdit}
              style={[
                styles.headerAction,
                { backgroundColor: colors.primaryLight },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("transaction.edit")}
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
            <ThemedText
              variant="caption"
              weight="bold"
              style={styles.heroBadgeText}
            >
              {isExpense
                ? t("common.expense").toUpperCase()
                : t("common.income").toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={styles.heroAmount}>
            {isExpense ? "-" : "+"}
            {formatCurrency(transaction.amount)}
          </ThemedText>
          <HeroCategoryPill
            icon={category?.icon}
            name={
              category ? categoryName(category) : t("common.unknownCategory")
            }
          />
        </LinearGradient>

        {/* Details */}
        <ThemedView variant="surface" style={styles.detailsCard}>
          <DetailRow
            icon={
              <Calendar size={17} strokeWidth={2.3} color={colors.primary} />
            }
            label={t("common.date")}
            value={formatDate(transaction.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          {transaction.note ? (
            <DetailRow
              icon={
                <FileText size={17} strokeWidth={2.3} color={colors.primary} />
              }
              label={t("common.note")}
              value={transaction.note}
            />
          ) : null}
          <DetailRow
            icon={<Tag size={17} strokeWidth={2.3} color={colors.primary} />}
            label={t("common.category")}
            value={
              category
                ? `${categoryName(category)} · ${
                    category.type === "income"
                      ? t("common.income")
                      : category.type === "both"
                        ? t("common.both")
                        : t("common.expense")
                  }`
                : t("common.unknown")
            }
          />
          <DetailRow
            icon={<Clock size={17} strokeWidth={2.3} color={colors.primary} />}
            label={t("transaction.createdAt")}
            value={formatDate(transaction.createdAt, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            isLast={transaction.updatedAt === transaction.createdAt}
          />
          {transaction.updatedAt !== transaction.createdAt && (
            <DetailRow
              icon={
                <Clock size={17} strokeWidth={2.3} color={colors.warning} />
              }
              label={t("transaction.updatedAt")}
              value={formatDate(transaction.updatedAt, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              isLast
            />
          )}
        </ThemedView>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t("transaction.edit")}
            onPress={handleEdit}
            variant="outline"
            size="md"
            fullWidth
          />
          <Button
            title={t("common.delete")}
            onPress={confirmDelete}
            variant="danger"
            size="md"
            fullWidth
          />
        </View>
      </Screen>
    </>
  );
}

function HeroCategoryPill({ icon, name }: { icon?: string; name: string }) {
  return (
    <View style={styles.heroCategoryRow}>
      <View style={styles.heroCategoryIcon}>
        {React.createElement(getCategoryIcon(icon), {
          size: 16,
          strokeWidth: 2.4,
          color: "#FFFFFF",
        })}
      </View>
      <ThemedText style={styles.heroCategoryName}>{name}</ThemedText>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const colors = useTheme();
  return (
    <View
      style={[
        styles.detailRow,
        !isLast && { borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}
      >
        {icon}
      </View>
      <View style={styles.detailText}>
        <ThemedText variant="caption" color="tertiary">
          {label}
        </ThemedText>
        <ThemedText
          variant="body"
          weight="semibold"
          color="primary"
          numberOfLines={2}
        >
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    textAlign: "center",
    marginTop: spacing.xl,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.lg,
    overflow: "hidden",
  },
  heroBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.22)",
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"],
    marginBottom: spacing.md,
  },
  heroCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  heroCategoryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCategoryName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  detailsCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    gap: 1,
  },
  actions: {
    gap: spacing.sm,
  },
});
