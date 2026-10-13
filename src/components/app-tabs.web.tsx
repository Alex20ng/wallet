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
import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Version web de la barre d'onglets (les onglets natifs `unstable-native-tabs`
// n'ont pas d'équivalent web fiable). Barre flottante en capsule, avec un effet
// de verre obtenu en CSS (`backdrop-filter`), donc sans dépendance supplémentaire.
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

export const TAB_BAR_HEIGHT = 66;
const BAR_SIDE_MARGIN = 16;
const BAR_MAX_WIDTH = 480;

/** Décalage du bas de la barre par rapport au bas de l'écran. */
function useBarBottom() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12);
}

/**
 * Espace à réserver en bas du contenu (padding du ScrollView, position du
 * bouton flottant « + ») pour que rien ne reste caché derrière la barre.
 */
export function useTabBarInset() {
  return TAB_BAR_HEIGHT + useBarBottom() + 16;
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: LucideIcon;
  activeColor: string;
  inactiveColor: string;
  pillColor: string;
};

function TabButton({
  icon: Icon,
  children,
  isFocused,
  activeColor,
  inactiveColor,
  pillColor,
  ...props
}: TabButtonProps) {
  const tint = isFocused ? activeColor : inactiveColor;
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withSpring(isFocused ? 1 : 0, {
      damping: 18,
      stiffness: 220,
    });
  }, [isFocused, focus]);

  // Capsule sous l'onglet actif : elle apparaît en grossissant
  const pillStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.86 + 0.14 * focus.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.08 * focus.value }],
  }));

  return (
    <Pressable
      {...props}
      style={styles.tab}
      accessibilityRole="link"
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.pill, { backgroundColor: pillColor }, pillStyle]}
      />
      <Animated.View style={iconStyle}>
        <Icon size={21} color={tint} strokeWidth={isFocused ? 2.4 : 2} />
      </Animated.View>
      <Text style={[styles.tabLabel, { color: tint }]} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? darkColors : lightColors;
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const bottom = useBarBottom();

  const barWidth = Math.min(width - BAR_SIDE_MARGIN * 2, BAR_MAX_WIDTH);

  // Propriétés CSS propres au web : verre flou, saturation et ombre portée.
  // Si le navigateur ne gère pas `backdrop-filter`, il reste le fond translucide.
  const webGlass = {
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.45)"
      : "0 10px 30px rgba(15,23,42,0.14)",
  } as unknown as ViewStyle;

  const pillColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.07)";

  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />

      <TabList
        style={[
          styles.tabList,
          {
            left: (width - barWidth) / 2,
            bottom,
            width: barWidth,
            backgroundColor: isDark
              ? "rgba(24,28,42,0.78)"
              : "rgba(255,255,255,0.80)",
            borderColor: isDark
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.85)",
          },
          webGlass,
        ]}
      >
        {TABS.map(({ name, href, titleKey, Icon }) => (
          <TabTrigger key={name} name={name} href={href} asChild>
            <TabButton
              icon={Icon}
              activeColor={colors.primary}
              inactiveColor={colors.textTertiary}
              pillColor={pillColor}
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
    position: "absolute",
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  pill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 4,
    right: 4,
    borderRadius: 28,
  },
  tabLabel: {
    fontSize: 9.7,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
