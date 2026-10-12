import { darkColors, lightColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/i18n";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const TABS = [
  {
    name: "index",
    titleKey: "tabs.home",
    sf: "square.grid.2x2.fill",
    md: "dashboard",
  },
  {
    name: "transactions",
    titleKey: "tabs.transactions",
    sf: "list.bullet.rectangle.fill",
    md: "receipt_long",
  },
  {
    name: "categories",
    titleKey: "tabs.categories",
    sf: "tag.fill",
    md: "sell",
  },
  { name: "budgets", titleKey: "tabs.budgets", sf: "chart.pie.fill", md: "savings" },
  {
    name: "settings",
    titleKey: "tabs.settings",
    sf: "gearshape.fill",
    md: "settings",
  },
] as const;

export default function AppTabs() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? darkColors : lightColors;
  const { t } = useTranslation();

  return (
    <NativeTabs tintColor={colors.primary}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{t(tab.titleKey)}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
