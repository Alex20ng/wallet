import { memo, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "../../hooks/use-theme";
import { formatCurrency } from "../../services/currency";
import { ThemedText, ThemedView } from "../ui";

interface TrendDataPoint {
  label: string;
  income: number; // en centimes
  expense: number; // en centimes
  date: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  showIncome?: boolean;
  showExpense?: boolean;
  animate?: boolean;
}

const Y_LABEL_WIDTH = 44;
const INITIAL_SPACING = 12;
const END_SPACING = 12;
const TOOLTIP_WIDTH = 170;

// 125000 centimes -> "1,3k"
function formatAxis(cents: number) {
  const units = cents / 100;
  if (units >= 1_000_000) {
    return `${(units / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (units >= 1_000) {
    return `${(units / 1_000).toFixed(units >= 10_000 ? 0 : 1).replace(".", ",")}k`;
  }
  return String(Math.round(units));
}

export const TrendChart = memo(function TrendChart({
  data,
  height = 220,
  showIncome = true,
  showExpense = true,
  animate = true,
}: TrendChartProps) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...data.map((d) =>
        Math.max(showIncome ? d.income : 0, showExpense ? d.expense : 0),
      ),
      1,
    );
    return max * 1.15;
  }, [data, showIncome, showExpense]);

  if (data.length === 0) {
    return (
      <ThemedView
        variant="surface"
        className="items-center justify-center rounded-3xl border-[0.5px] border-gray-500/20"
        style={{ height }}
      >
        <ThemedText variant="body" color="tertiary">
          Aucune donnée
        </ThemedText>
      </ThemedView>
    );
  }

  // Séries affichées (la première devient `data`, la seconde `data2`)
  const series = [
    showIncome && {
      key: "income" as const,
      name: "Revenus",
      color: colors.success,
      points: data.map((d) => ({ value: d.income, label: d.label })),
    },
    showExpense && {
      key: "expense" as const,
      name: "Dépenses",
      color: colors.error,
      points: data.map((d) => ({ value: d.expense, label: d.label })),
    },
  ].filter(Boolean) as {
    key: "income" | "expense";
    name: string;
    color: string;
    points: { value: number; label: string }[];
  }[];

  const [first, second] = series;

  const chartWidth = Math.max(width - Y_LABEL_WIDTH - 8, 0);
  const pointSpacing =
    data.length > 1
      ? Math.max(
          (chartWidth - INITIAL_SPACING - END_SPACING) / (data.length - 1),
          24,
        )
      : 0;

  return (
    <ThemedView
      variant="surface"
      className="rounded-3xl border-[0.5px] border-gray-500/20 p-5"
    >
      <View onLayout={onLayout} style={{ height }}>
        {chartWidth > 0 && first && (
          <LineChart
            data={first.points}
            data2={second?.points}
            width={chartWidth}
            height={height - 40}
            maxValue={maxValue}
            noOfSections={4}
            spacing={pointSpacing}
            initialSpacing={INITIAL_SPACING}
            endSpacing={END_SPACING}
            // Courbes
            curved
            curvature={0.2}
            thickness={3}
            thickness2={3}
            color={first.color}
            color2={second?.color}
            // Dégradé sous les courbes
            areaChart
            startFillColor={first.color}
            endFillColor={first.color}
            startOpacity={0.28}
            endOpacity={0.02}
            startFillColor2={second?.color}
            endFillColor2={second?.color}
            startOpacity2={0.22}
            endOpacity2={0.02}
            // Points masqués, visibles via le tooltip
            hideDataPoints
            // Axes et grille discrets
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelWidth={Y_LABEL_WIDTH}
            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
            formatYLabel={(label) => formatAxis(Number(label))}
            rulesType="dashed"
            dashWidth={4}
            dashGap={6}
            rulesColor={colors.border}
            rulesThickness={0.6}
            backgroundColor="transparent"
            // Animation
            isAnimated={animate}
            animationDuration={animate ? 900 : 0}
            // Tooltip au toucher
            pointerConfig={{
              pointerStripUptoDataPoint: true,
              pointerStripColor: colors.border,
              pointerStripWidth: 1.5,
              strokeDashArray: [4, 4],
              pointerColor: first.color,
              radius: 5,
              pointerLabelWidth: TOOLTIP_WIDTH,
              pointerLabelHeight: 80,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (
                items: { value: number; label?: string }[],
              ) => (
                <View
                  className="gap-1 rounded-2xl px-3 py-2"
                  style={{
                    backgroundColor: colors.textPrimary,
                    width: TOOLTIP_WIDTH,
                  }}
                >
                  <ThemedText
                    variant="caption"
                    weight="bold"
                    style={{ color: colors.surface }}
                  >
                    {items[0]?.label}
                  </ThemedText>
                  {items.map((item, i) => (
                    <View key={i} className="flex-row items-center gap-1.5">
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: series[i]?.color }}
                      />
                      <ThemedText
                        variant="caption"
                        style={{ color: colors.surface }}
                      >
                        {series[i]?.name} : {formatCurrency(item.value)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ),
            }}
          />
        )}
      </View>
    </ThemedView>
  );
});

export default TrendChart;
