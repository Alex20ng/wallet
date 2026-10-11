import { useTheme } from "@/hooks/use-theme";
import { formatCurrency } from "@/services/currency";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ui";

interface LegendItem {
  name: string;
  value: number; // centimes
  color: string;
}

interface CategoryLegendProps {
  data: LegendItem[];
}

function formatPercent(percent: number) {
  if (percent > 0 && percent < 1) return "<1%";
  return `${Math.round(percent)}%`;
}

export const CategoryLegend = memo(function CategoryLegend({
  data,
}: CategoryLegendProps) {
  const colors = useTheme();

  const items = useMemo(() => {
    const filtered = data.filter((d) => d.value > 0);
    const total = filtered.reduce((sum, d) => sum + d.value, 0);
    return [...filtered]
      .sort((a, b) => b.value - a.value)
      .map((d) => ({
        ...d,
        percent: total > 0 ? (d.value / total) * 100 : 0,
      }));
  }, [data]);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View
          key={item.name}
          style={[
            styles.row,
            index > 0 && {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Pastille de couleur */}
          <View style={[styles.dot, { backgroundColor: item.color }]} />

          {/* Nom : jamais coupé sur une seule ligne, 2 lignes maximum */}
          <ThemedText
            variant="body"
            weight="semibold"
            color="primary"
            numberOfLines={2}
            style={styles.name}
          >
            {item.name}
          </ThemedText>

          {/* Pourcentage dans une pastille teintée de la couleur de la catégorie */}
          <View
            style={[
              styles.percentBadge,
              { backgroundColor: item.color + "26" },
            ]}
          >
            <ThemedText variant="caption" weight="bold" color="primary">
              {formatPercent(item.percent)}
            </ThemedText>
          </View>

          {/* Montant */}
          <ThemedText
            variant="body"
            weight="bold"
            color="primary"
            numberOfLines={1}
            style={styles.amount}
          >
            {formatCurrency(item.value)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  name: {
    flex: 1,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    minWidth: 44,
    alignItems: "center",
  },
  amount: {
    minWidth: 84,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});

export default CategoryLegend;
