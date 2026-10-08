import { CATEGORY_ICON_MAP } from "@/constants/category-icons";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { formatCurrency } from "@/services/currency";
import { Bell, Pencil, Trash } from "lucide-react-native";
import { memo, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText, ThemedView } from "../ui";

interface BudgetCardProps {
  spent: number; // centimes
  budget: number; // centimes
  alertThreshold: number; // 0 à 1
  categoryName: string;
  categoryColor: string;
  categoryIcon?: string;
  onEdit: () => void;
  onDelete: () => void;
}

type Status = "good" | "warning" | "over";

const STATUS_LABEL: Record<Status, string> = {
  good: "Dans le budget",
  warning: "Attention",
  over: "Dépassé",
};

export const BudgetCard = memo(function BudgetCard({
  spent,
  budget,
  alertThreshold,
  categoryName,
  categoryColor,
  categoryIcon,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const colors = useTheme();
  const progress = useSharedValue(0);

  const ratio = budget > 0 ? spent / budget : spent > 0 ? 1 : 0;
  const barRatio = Math.min(ratio, 1);
  const remaining = budget - spent;
  const isOver = remaining < 0;

  const status: Status =
    ratio > 1 ? "over" : ratio >= alertThreshold ? "warning" : "good";
  const statusColor =
    status === "over"
      ? colors.error
      : status === "warning"
        ? colors.warning
        : categoryColor;

  const Icon = categoryIcon ? CATEGORY_ICON_MAP[categoryIcon] : undefined;

  useEffect(() => {
    progress.value = withTiming(barRatio, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, [barRatio, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const press = (action: () => void) => () => {
    haptics.impact(haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <ThemedView
      variant="surface"
      style={[styles.card, { borderColor: colors.border }]}
    >
      <View style={styles.body}>
        {/* En-tête */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: categoryColor + "22" },
            ]}
          >
            {Icon ? (
              <Icon size={20} strokeWidth={2.2} color={categoryColor} />
            ) : (
              <View style={[styles.dot, { backgroundColor: categoryColor }]} />
            )}
          </View>

          <View style={styles.headerText}>
            <ThemedText variant="body" weight="bold" numberOfLines={1}>
              {categoryName}
            </ThemedText>
            <View style={styles.badgeRow}>
              <View
                style={[styles.badge, { backgroundColor: statusColor + "20" }]}
              >
                <ThemedText
                  variant="caption"
                  weight="semibold"
                  style={{ color: statusColor }}
                >
                  {STATUS_LABEL[status]}
                </ThemedText>
              </View>
              <ThemedText variant="caption" color="tertiary">
                {Math.round(ratio * 100)}%
              </ThemedText>
            </View>
          </View>

          <View style={styles.remaining}>
            <ThemedText
              variant="body"
              weight="bold"
              color={isOver ? "error" : "primary"}
              style={styles.tabular}
            >
              {isOver
                ? `-${formatCurrency(Math.abs(remaining))}`
                : formatCurrency(remaining)}
            </ThemedText>
            <ThemedText variant="caption" color="tertiary">
              {isOver ? "dépassé" : "restant"}
            </ThemedText>
          </View>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressWrapper}>
          <View
            style={[
              styles.track,
              { backgroundColor: colors.backgroundTertiary },
            ]}
          >
            <Animated.View
              style={[styles.fill, { backgroundColor: statusColor }, fillStyle]}
            />
          </View>

          {/* Repère du seuil d'alerte */}
          {alertThreshold > 0 && alertThreshold < 1 && (
            <View
              pointerEvents="none"
              style={[
                styles.threshold,
                {
                  left: `${alertThreshold * 100}%`,
                  backgroundColor: colors.textTertiary,
                },
              ]}
            />
          )}
        </View>

        {/* Dépensé / Budget */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <ThemedText variant="caption" color="tertiary">
              Dépensé
            </ThemedText>
            <ThemedText variant="body" weight="semibold" style={styles.tabular}>
              {spent > 0 ? formatCurrency(spent) : "—"}
            </ThemedText>
          </View>
          <View style={[styles.stat, styles.statRight]}>
            <ThemedText variant="caption" color="tertiary">
              Budget
            </ThemedText>
            <ThemedText variant="body" weight="semibold" style={styles.tabular}>
              {formatCurrency(budget)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Pied de carte */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.alertInfo}>
          <Bell size={14} strokeWidth={2.2} color={colors.textTertiary} />
          <ThemedText variant="caption" color="tertiary">
            {`Alerte à ${Math.round(alertThreshold * 100)}%`}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={press(onEdit)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Modifier le budget ${categoryName}`}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primaryLight },
              pressed && styles.pressed,
            ]}
          >
            <Pencil size={16} strokeWidth={2.3} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={press(onDelete)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Supprimer le budget ${categoryName}`}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.errorLight },
              pressed && styles.pressed,
            ]}
          >
            <Trash size={16} strokeWidth={2.3} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  body: {
    padding: 20,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  remaining: {
    alignItems: "flex-end",
    gap: 2,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  progressWrapper: {
    height: 10,
    justifyContent: "center",
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
  threshold: {
    position: "absolute",
    top: -3,
    bottom: -3,
    width: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    gap: 2,
  },
  statRight: {
    alignItems: "flex-end",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  alertInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});

export default BudgetCard;
