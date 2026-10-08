import { Screen } from "@/components/layout";
import { Switch, ThemedText, ThemedView } from "@/components/ui";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { setThemePreference } from "@/hooks/theme-preference";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { CURRENCY_CODE, CURRENCY_LOCALE } from "@/services/currency";
import type { LucideIcon } from "lucide-react-native";
import {
  Bell,
  CalendarDays,
  FileSignature,
  FileText,
  Info,
  Lock,
  Moon,
  Palette,
  Shield,
  Wallet,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";

type SettingItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  description: string;
} & (
  | { type: "switch"; value: boolean; onToggle: (value: boolean) => void }
  | { type: "value"; value: string }
  | { type: "action"; onPress: () => void; danger?: boolean }
);

type SettingSection = {
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [bioEnabled, setBioEnabled] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(false);

  const handleExport = async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Export CSV",
      "Fonctionnalité à implémenter avec le composant d'export",
    );
  };

  const handleExportJSON = async () => {
    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Export JSON",
      "Fonctionnalité à implémenter avec le composant d'export",
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Effacer toutes les données",
      "Cette action est IRRÉVERSIBLE. Toutes vos transactions, catégories et budgets seront supprimés définitivement.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Effacer tout",
          style: "destructive",
          onPress: async () => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              "Confirmation finale",
              "Êtes-vous absolument certain ?",
              [
                { text: "Non", style: "cancel" },
                {
                  text: "OUI, TOUT EFFACER",
                  style: "destructive",
                  onPress: async () => {
                    await haptics.notification(
                      haptics.NotificationFeedbackType.Success,
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const settingsSections: SettingSection[] = [
    {
      title: "Apparence",
      icon: Palette,
      items: [
        {
          key: "theme",
          icon: Moon,
          label: "Mode sombre",
          description: isDark ? "Thème sombre activé" : "Thème clair activé",
          type: "switch",
          value: isDark,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            await setThemePreference(value ? "dark" : "light");
          },
        },
        {
          key: "currency",
          icon: Wallet,
          label: "Devise",
          description: `Format : ${CURRENCY_LOCALE}`,
          type: "value",
          value: CURRENCY_CODE,
        },
      ],
    },
    {
      title: "Sécurité",
      icon: Lock,
      items: [
        {
          key: "bio",
          icon: Shield,
          label: "Authentification biométrique",
          description: "Face ID / Touch ID / empreinte",
          type: "switch",
          value: bioEnabled,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setBioEnabled(value);
          },
        },
        {
          key: "autolock",
          icon: Lock,
          label: "Verrouillage automatique",
          description: "Après 1 minute en arrière-plan",
          type: "switch",
          value: autoLock,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setAutoLock(value);
          },
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "budget-alerts",
          icon: CalendarDays,
          label: "Rappels de budget",
          description: "Alertes quand vous approchez de la limite",
          type: "switch",
          value: notificationsEnabled,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setNotificationsEnabled(value);
          },
        },
        {
          key: "monthly-report",
          icon: FileText,
          label: "Rapport mensuel",
          description: "Recevoir un résumé chaque mois",
          type: "switch",
          value: monthlyReport,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setMonthlyReport(value);
          },
        },
      ],
    },
    {
      title: "À propos",
      icon: Info,
      items: [
        {
          key: "version",
          icon: Info,
          label: "Version",
          description: "Wallet — gestion de dépenses",
          type: "value",
          value: "1.0.0",
        },
        {
          key: "terms",
          icon: FileSignature,
          label: "Conditions d'utilisation",
          description: "Lire les conditions",
          type: "action",
          onPress: () => Linking.openURL("https://example.com/terms"),
        },
        {
          key: "privacy",
          icon: Shield,
          label: "Politique de confidentialité",
          description: "Vos données restent sur votre appareil",
          type: "action",
          onPress: () => Linking.openURL("https://example.com/privacy"),
        },
      ],
    },
  ];

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <ThemedText
            variant="caption"
            color="tertiary"
            style={styles.pageDate}
          >
            Version 1.0.0
          </ThemedText>
          <ThemedText variant="headline" weight="bold">
            Paramètres
          </ThemedText>
        </View>
      </View>

      <View>
        {settingsSections.map((section) => (
          <ThemedView
            key={section.title}
            variant="surface"
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <section.icon
                  size={16}
                  strokeWidth={2.4}
                  color={colors.primary}
                />
              </View>
              <ThemedText
                variant="caption"
                weight="bold"
                color="tertiary"
                style={styles.sectionTitle}
              >
                {section.title.toUpperCase()}
              </ThemedText>
            </View>

            {section.items.map((item, index) => (
              <View
                key={item.key}
                style={
                  index > 0
                    ? [styles.itemDivider, { borderTopColor: colors.border }]
                    : undefined
                }
              >
                <SettingRow item={item} />
              </View>
            ))}
          </ThemedView>
        ))}
      </View>
    </Screen>
  );
}

function SettingRow({ item }: { item: SettingItem }) {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const Icon = item.icon;
  const tint =
    item.type === "action" && item.danger ? colors.error : colors.primary;
  const tintBg =
    item.type === "action" && item.danger
      ? colors.errorLight
      : colors.primaryLight;

  const content = (
    <View style={styles.itemContent}>
      <View style={[styles.itemIcon, { backgroundColor: tintBg }]}>
        <Icon size={17} strokeWidth={2.3} color={tint} />
      </View>
      <View style={styles.itemText}>
        <ThemedText
          variant="body"
          weight="semibold"
          color={item.type === "action" && item.danger ? "error" : "primary"}
        >
          {item.label}
        </ThemedText>
        <ThemedText variant="caption" color="tertiary">
          {item.description}
        </ThemedText>
      </View>
      {item.type === "switch" && (
        <Switch value={item.value} onValueChange={item.onToggle} />
      )}
      {item.type === "value" && (
        <ThemedText
          variant="caption"
          weight="bold"
          color="secondary"
          style={styles.itemValue}
        >
          {item.value}
        </ThemedText>
      )}
    </View>
  );

  if (item.type === "action") {
    return (
      <Pressable
        onPress={async () => {
          await haptics.impact(haptics.ImpactFeedbackStyle.Light);
          item.onPress();
        }}
        style={({ pressed }) => [
          pressed && { backgroundColor: colors.backgroundSecondary },
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        android_ripple={{ color: colors.backgroundSecondary }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pageHeader: {
    marginBottom: spacing.md,
  },
  pageHeaderText: {
    flex: 1,
  },
  pageDate: {
    marginBottom: 2,
    textTransform: "capitalize",
  },
  section: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  itemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    gap: 1,
  },
  itemValue: {
    letterSpacing: 0.5,
  },
  versionFooter: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  versionText: {
    textAlign: "center",
  },
});
