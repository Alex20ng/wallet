import { useTheme } from "@/hooks/use-theme";
import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { spacing } from "../../constants/theme";
import { formatCurrency } from "../../services/currency";
import { ThemedText, ThemedView } from "../ui";

interface PieChartData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

interface CategoryPieChartProps {
  data: PieChartData[];
  centerContent?: React.ReactNode;
  size?: number;
  showLegend?: boolean;
  animate?: boolean;
}

export const CategoryPieChart = memo(function CategoryPieChart({
  data,
  centerContent,
  size = 200,
  showLegend = false,
  animate = true,
}: CategoryPieChartProps) {
  const colors = useTheme();

  if (data.length === 0) {
    return (
      <ThemedView
        variant="surface"
        style={[styles.container, { width: size, height: size }]}
      >
        <View style={styles.emptyState}>
          <ThemedText variant="body" color="tertiary" style={styles.emptyText}>
            Aucune donnée
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map((item) => ({
    value: item.value,
    color: item.color,
    text: `${item.name} ${total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%`,
  }));

  return (
    <ThemedView variant="surface" className="mx-auto gap-16">
      <View style={{ width: size, height: size, alignSelf: "center" }}>
        <PieChart
          data={chartData}
          radius={size * 0.48}
          innerRadius={size * 0.35}
          donut
          innerCircleColor={colors.surface}
          backgroundColor="transparent"
          isAnimated={animate}
          animationDuration={800}
          showText={false}
          centerLabelComponent={() => (
            <View className="items-center justify-center">{centerContent}</View>
          )}
        />
      </View>
      {showLegend && (
        <View style={styles.legend}>
          {data.map((item) => (
            <View key={item.name} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <ThemedText
                variant="caption"
                color="secondary"
                numberOfLines={1}
                style={styles.legendLabel}
              >
                {item.name}
              </ThemedText>
              <ThemedText
                variant="caption"
                weight="semibold"
                color="primary"
                style={styles.legendValue}
              >
                {item.value > 0 ? formatCurrency(item.value) : "—"}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.md,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  legend: {
    width: "100%",
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {
    minWidth: 60,
    textAlign: "right",
  },
});

export default CategoryPieChart;
