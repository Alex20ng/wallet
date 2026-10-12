import { memo, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "../../hooks/use-theme";
import { useTranslation } from "../../i18n";
import { useFormatCurrency } from "../../services/currency";
import { ThemedText } from "../ui";

interface TrendDataPoint {
  label: string;
  income: number; // centimes
  expense: number; // centimes
  date: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  /** Hauteur totale du composant, étiquettes de l'axe X comprises */
  height?: number;
  showIncome?: boolean;
  showExpense?: boolean;
  showLegend?: boolean;
  animate?: boolean;
}

const Y_LABEL_WIDTH = 42;
const X_LABELS_HEIGHT = 30;
const OVERFLOW_TOP = 8;
const OVERFLOW_BOTTOM = 14; // évite de couper le bas des courbes
const INITIAL_SPACING = 10;
const END_SPACING = 10;
const TOOLTIP_WIDTH = 170;
const MAX_VISIBLE_X_LABELS = 6;

// 125000 centimes -> "1,3k" (localisé)
function formatAxis(cents: number, locale: string) {
  const units = cents / 100;
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: units >= 10_000 ? 0 : 1,
  }).format(units);
}

type Point = { value: number; label: string; fullLabel: string };

export const TrendChart = memo(function TrendChart({
  data,
  height = 220,
  showIncome = true,
  showExpense = true,
  showLegend = true,
  animate = true,
}: TrendChartProps) {
  const colors = useTheme();
  const { t, locale } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.floor(e.nativeEvent.layout.width));

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...data.map((d) =>
        Math.max(showIncome ? d.income : 0, showExpense ? d.expense : 0),
      ),
      1,
    );
    return max * 1.15;
  }, [data, showIncome, showExpense]);

  // Évite des étiquettes qui se chevauchent quand il y a beaucoup de points
  const labelStep = Math.max(1, Math.ceil(data.length / MAX_VISIBLE_X_LABELS));

  const series = useMemo(() => {
    const toPoints = (key: "income" | "expense"): Point[] =>
      data.map((d, i) => ({
        value: d[key],
        label: i % labelStep === 0 ? d.label : "",
        fullLabel: d.label,
      }));

    return [
      showIncome && {
        key: "income" as const,
        name: t("common.incomes"),
        color: colors.success,
        points: toPoints("income"),
      },
      showExpense && {
        key: "expense" as const,
        name: t("common.expenses"),
        color: colors.error,
        points: toPoints("expense"),
      },
    ].filter(Boolean) as {
      key: "income" | "expense";
      name: string;
      color: string;
      points: Point[];
    }[];
  }, [data, labelStep, showIncome, showExpense, colors.success, colors.error, t]);

  if (data.length === 0 || series.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <ThemedText variant="body" color="tertiary">
          {t("common.noData")}
        </ThemedText>
      </View>
    );
  }

  const [first, second] = series;

  const chartWidth = Math.max(width - Y_LABEL_WIDTH - 12, 0);
  const plotHeight = Math.max(
    height - X_LABELS_HEIGHT - OVERFLOW_TOP - OVERFLOW_BOTTOM,
    80,
  );
  const pointSpacing =
    data.length > 1
      ? Math.max(
          (chartWidth - INITIAL_SPACING - END_SPACING) / (data.length - 1),
          20,
        )
      : 0;

  return (
    <View style={styles.container}>
      <View onLayout={onLayout} style={styles.chartWrapper}>
        {chartWidth > 0 && (
          <LineChart
            data={first.points}
            data2={second?.points}
            width={chartWidth}
            height={plotHeight}
            overflowTop={OVERFLOW_TOP}
            overflowBottom={OVERFLOW_BOTTOM}
            xAxisLabelsHeight={X_LABELS_HEIGHT - 6}
            maxValue={maxValue}
            noOfSections={4}
            spacing={pointSpacing}
            initialSpacing={INITIAL_SPACING}
            endSpacing={END_SPACING}
            // Courbes
            curved
            curvature={0.12}
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
            hideDataPoints
            // Axes et grille discrets
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelWidth={Y_LABEL_WIDTH}
            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
            formatYLabel={(label) => formatAxis(Number(label), locale)}
            rulesType="dashed"
            dashWidth={4}
            dashGap={6}
            rulesColor={colors.border}
            rulesThickness={0.6}
            backgroundColor="transparent"
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
              pointerLabelComponent: (items: Partial<Point>[]) => (
                <View
                  style={[
                    styles.tooltip,
                    { backgroundColor: colors.textPrimary },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    weight="bold"
                    style={{ color: colors.surface }}
                  >
                    {items[0]?.fullLabel ?? items[0]?.label}
                  </ThemedText>
                  {items.map((item, i) => (
                    <View key={i} style={styles.tooltipRow}>
                      <View
                        style={[
                          styles.tooltipDot,
                          { backgroundColor: series[i]?.color },
                        ]}
                      />
                      <ThemedText
                        variant="caption"
                        numberOfLines={1}
                        style={{ color: colors.surface }}
                      >
                        {series[i]?.name} : {formatCurrency(item.value ?? 0)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ),
            }}
          />
        )}
      </View>

      {showLegend && (
        <View style={styles.legend}>
          {series.map((s) => (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: s.color }]} />
              <ThemedText variant="caption" color="secondary">
                {s.name}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  chartWrapper: {
    width: "100%",
    overflow: "hidden",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    width: TOOLTIP_WIDTH,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TrendChart;
