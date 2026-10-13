import { darkColors, lightColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/i18n";
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import {
  ChartPie,
  LayoutGrid,
  List,
  Settings,
  Tags,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Les onglets natifs (`unstable-native-tabs`) n'ont pas d'équivalent web fiable.
// On reproduit ici une barre d'onglets en bas, identique aux routes natives.
const TABS = [
  { name: "index", href: "/", titleKey: "tabs.home", Icon: LayoutGrid },
  {
    name: "transactions",
    href: "/transactions",
    titleKey: "tabs.transactions",
    Icon: List,
  },
  {
    name: "categories",
    href: "/categories",
    titleKey: "tabs.categories",
    Icon: Tags,
  },
  {
    name: "budgets",
    href: "/budgets",
    titleKey: "tabs.budgets",
    Icon: ChartPie,
  },
  {
    name: "settings",
    href: "/settings",
    titleKey: "tabs.settings",
    Icon: Settings,
  },
] as const;

type TabButtonProps = TabTriggerSlotProps & {
  icon: LucideIcon;
  activeColor: string;
  inactiveColor: string;
};

function TabButton({
  icon: Icon,
  children,
  isFocused,
  activeColor,
  inactiveColor,
  ...props
}: TabButtonProps) {
  const tint = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable {...props} style={styles.tab} accessibilityRole="link">
      <Icon size={22} color={tint} strokeWidth={isFocused ? 2.4 : 2} />
      <Text style={[styles.tabLabel, { color: tint }]} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? darkColors : lightColors;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList
        style={[
          styles.tabList,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: 8 + insets.bottom,
          },
        ]}
      >
        {TABS.map(({ name, href, titleKey, Icon }) => (
          <TabTrigger key={name} name={name} href={href} asChild>
            <TabButton
              icon={Icon}
              activeColor={colors.primary}
              inactiveColor={colors.textTertiary}
            >
              {t(titleKey)}
            </TabButton>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  // `TabSlot` (react-native-screens ScreenContainer) définit flexShrink:0 : le
  // contenu long ne rétrécit pas et pousse la barre hors de l'écran (body en
  // overflow:hidden). On le borne pour que le ScrollView interne défile.
  slot: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    overflow: "hidden",
  },
  tabList: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
