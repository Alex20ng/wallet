import { memo, useId, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../../hooks/use-theme";
import { useTranslation } from "../../i18n";
import { useFormatCurrency } from "../../services/currency";
import { ThemedText } from "../ui";
import type { TrendChartProps } from "./TrendChart.types";

const Y_LABEL_WIDTH = 42;
const MAX_VISIBLE_X_LABELS = 6;
const TOOLTIP_WIDTH = 170;

function formatAxis(cents: number, locale: string) {
  const units = cents / 100;
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: units >= 10_000 ? 0 : 1,
  }).format(units);
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: number;
  color?: string;
}

interface TooltipContentProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  background: string;
  textColor: string;
  names: Record<string, string>;
  formatCurrency: (value: number) => string;
}

function TrendTooltip({
  active,
  payload,
  label,
  background,
  textColor,
  names,
  formatCurrency,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        width: TOOLTIP_WIDTH,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 12px",
        borderRadius: 16,
        backgroundColor: background,
      }}
    >
      <span style={{ color: textColor, fontWeight: 700, fontSize: 12 }}>
        {label}
      </span>
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: entry.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ color: textColor, fontSize: 12 }}>
            {names[String(entry.dataKey)]} : {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

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
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");

  const series = useMemo(
    () =>
      [
        showIncome && {
          key: "income" as const,
          name: t("common.incomes"),
          color: colors.success,
        },
        showExpense && {
          key: "expense" as const,
          name: t("common.expenses"),
          color: colors.error,
        },
      ].filter(Boolean) as {
        key: "income" | "expense";
        name: string;
        color: string;
      }[],
    [showIncome, showExpense, colors.success, colors.error, t],
  );

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        label: d.label,
        income: Number.isFinite(d.income) ? d.income : 0,
        expense: Number.isFinite(d.expense) ? d.expense : 0,
      })),
    [data],
  );

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...data.map((d) =>
        Math.max(showIncome ? d.income : 0, showExpense ? d.expense : 0),
      ),
      1,
    );
    return max * 1.15;
  }, [data, showIncome, showExpense]);

  const labelStep = Math.max(1, Math.ceil(data.length / MAX_VISIBLE_X_LABELS));

  const names = useMemo(
    () =>
      Object.fromEntries(series.map((s) => [s.key, s.name])) as Record<
        string,
        string
      >,
    [series],
  );

  if (data.length === 0 || series.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <ThemedText variant="body" color="tertiary">
          {t("common.noData")}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`trend-${s.key}-${uid}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              vertical={false}
              stroke={colors.border}
              strokeWidth={0.6}
              strokeDasharray="4 6"
            />
            <XAxis
              dataKey="label"
              interval={labelStep - 1}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.textTertiary, fontSize: 10 }}
            />
            <YAxis
              width={Y_LABEL_WIDTH}
              domain={[0, maxValue]}
              tickCount={5}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.textTertiary, fontSize: 10 }}
              tickFormatter={(value) => formatAxis(Number(value), locale)}
            />
            <Tooltip
              cursor={{
                stroke: colors.border,
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
              }}
              content={
                <TrendTooltip
                  background={colors.textPrimary}
                  textColor={colors.surface}
                  names={names}
                  formatCurrency={formatCurrency}
                />
              }
            />

            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={3}
                fill={`url(#trend-${s.key}-${uid})`}
                dot={false}
                activeDot={{ r: 5, stroke: colors.surface, strokeWidth: 2 }}
                isAnimationActive={animate}
                animationDuration={animate ? 900 : 0}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
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
  empty: {
    alignItems: "center",
    justifyContent: "center",
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
