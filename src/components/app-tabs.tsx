import { darkColors, lightColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const TABS = [
  {
    name: "index",
    title: "Accueil",
    sf: "square.grid.2x2.fill",
    md: "dashboard",
  },
  {
    name: "transactions",
    title: "Transactions",
    sf: "list.bullet.rectangle.fill",
    md: "receipt_long",
  },
  { name: "categories", title: "Catégories", sf: "tag.fill", md: "sell" },
  { name: "budgets", title: "Budgets", sf: "chart.pie.fill", md: "savings" },
  { name: "settings", title: "Réglages", sf: "gearshape.fill", md: "settings" },
] as const;

export default function AppTabs() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? darkColors : lightColors;

  return (
    <NativeTabs tintColor={colors.primary}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{tab.title}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
