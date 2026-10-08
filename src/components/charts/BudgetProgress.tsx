import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { spacing } from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";
import { formatCurrency } from "../../services/currency";
import { ThemedText, ThemedView } from "../ui";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  categoryName: string;
  categoryColor: string;
  showAmount?: boolean;
  animate?: boolean;
}

export const BudgetProgress = memo(function BudgetProgress({
  spent,
  budget,
  categoryName,
  categoryColor,
  showAmount = true,
  animate = true,
}: BudgetProgressProps) {
  const colors = useTheme();
  const progress = useSharedValue(0);
  const percentage = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const isOverBudget = spent > budget;
  const isNearLimit = percentage >= 0.8 && !isOverBudget;

  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: animate ? 800 : 0,
      easing: Easing.out(Easing.quad),
    });
  }, [percentage, animate, progress]);

  const progressColor = isOverBudget
    ? colors.error
    : isNearLimit
      ? colors.warning
      : categoryColor;
  const bgColor = progressColor + "20";

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
    backgroundColor: progressColor,
  }));

  return (
    <ThemedView variant="surface" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <ThemedView style={styles.categoryDot} variant="secondary">
            <View style={[styles.dot, { backgroundColor: categoryColor }]} />
          </ThemedView>
          <ThemedText
            variant="body"
            weight="medium"
            color="primary"
            style={styles.categoryName}
          >
            {categoryName}
          </ThemedText>
        </View>
        {showAmount && (
          <ThemedText
            variant="body"
            weight="semibold"
            color={isOverBudget ? "error" : isNearLimit ? "warning" : "primary"}
            style={styles.amount}
          >
            {spent > 0 ? formatCurrency(spent) : "—"} / {formatCurrency(budget)}
          </ThemedText>
        )}
      </View>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressTrack, { backgroundColor: bgColor }]}
        >
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </Animated.View>
      </View>
      {isOverBudget && (
        <ThemedText variant="caption" color="error" style={styles.warningText}>
          Dépassement de {formatCurrency(spent - budget)}
        </ThemedText>
      )}
      {isNearLimit && !isOverBudget && (
        <ThemedText
          variant="caption"
          color="warning"
          style={styles.warningText}
        >
          Attention: {Math.round(percentage * 100)}% du budget utilisé
        </ThemedText>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    flex: 1,
  },
  amount: {
    fontVariant: ["tabular-nums"],
    minWidth: 80,
    textAlign: "right",
  },
  progressContainer: {
    height: 8,
  },
  progressTrack: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  warningText: {
    marginTop: spacing.xs,
  },
});

export default BudgetProgress;
