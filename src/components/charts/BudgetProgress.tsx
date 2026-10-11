import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../hooks/use-theme";
import { formatCurrency } from "../../services/currency";
import { ThemedText } from "../ui";

interface BudgetProgressProps {
  spent: number; // centimes
  budget: number; // centimes
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

  const ratio = budget > 0 ? spent / budget : spent > 0 ? 1 : 0;
  const barRatio = Math.min(ratio, 1);
  const isOverBudget = spent > budget;
  const isNearLimit = ratio >= 0.8 && !isOverBudget;

  const progressColor = isOverBudget
    ? colors.error
    : isNearLimit
      ? colors.warning
      : categoryColor;

  useEffect(() => {
    progress.value = withTiming(barRatio, {
      duration: animate ? 800 : 0,
      easing: Easing.out(Easing.quad),
    });
  }, [barRatio, animate, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Ligne 1 : catégorie + pourcentage (le nom rétrécit, jamais le reste) */}
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: categoryColor + "22" },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: categoryColor }]} />
          </View>
          <ThemedText
            variant="body"
            weight="semibold"
            color="primary"
            numberOfLines={1}
            style={styles.categoryName}
          >
            {categoryName}
          </ThemedText>
        </View>

        <ThemedText
          variant="caption"
          weight="bold"
          style={{ color: progressColor }}
        >
          {Math.round(ratio * 100)}%
        </ThemedText>
      </View>

      {/* Ligne 2 : barre */}
      <View
        style={[styles.track, { backgroundColor: colors.backgroundTertiary }]}
      >
        <Animated.View
          style={[styles.fill, { backgroundColor: progressColor }, fillStyle]}
        />
      </View>

      {/* Ligne 3 : montants, sur la largeur disponible, sans débordement */}
      {showAmount && (
        <View style={styles.amounts}>
          <ThemedText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.spent,
              { color: isOverBudget ? colors.error : colors.textPrimary },
            ]}
          >
            {spent > 0 ? formatCurrency(spent) : "—"}
          </ThemedText>
          <ThemedText
            variant="caption"
            color="tertiary"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={styles.total}
          >
            {`sur ${formatCurrency(budget)}`}
          </ThemedText>
        </View>
      )}

      {isOverBudget && (
        <ThemedText variant="caption" color="error" numberOfLines={2}>
          {`Dépassement de ${formatCurrency(spent - budget)}`}
        </ThemedText>
      )}
      {isNearLimit && (
        <ThemedText variant="caption" color="warning" numberOfLines={2}>
          {`Attention : ${Math.round(ratio * 100)}% du budget utilisé`}
        </ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryName: {
    flex: 1,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  amounts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  spent: {
    flexShrink: 1,
    fontVariant: ["tabular-nums"],
  },
  total: {
    flexShrink: 1,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});

export default BudgetProgress;
