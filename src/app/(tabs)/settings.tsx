import Select from "@/components/forms/select";
import { Screen } from "@/components/layout";
import { Switch, ThemedText, ThemedView } from "@/components/ui";
import { CURRENCIES } from "@/constants/currencies";
import { borderRadius, shadows, spacing } from "@/constants/theme";
import { setThemePreference } from "@/hooks/theme-preference";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { LANGUAGES } from "@/i18n/translations";
import {
  applyBackup,
  hasTransactions,
  importTransactionsCSV,
  parseBackupJSON,
  serializeBackup,
  serializeTransactionsCSV,
  timestampForFilename,
  type ImportResult,
} from "@/services/backup";
import { pickTextFile, saveTextFile } from "@/services/file-transfer";
import { NotificationService } from "@/services/notifications/NotificationService";
import { notificationPreferences } from "@/storage/notificationPreferences";
import { useAppStore } from "@/store/useAppStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { alert } from "@/utils/alert";
import { chooseImportMode } from "@/utils/import-mode";
import { pickTime } from "@/utils/pick-time";
import { router, useFocusEffect } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  Bell,
  CalendarDays,
  Database,
  FileJson,
  FileSignature,
  FileSpreadsheet,
  Info,
  Languages,
  Moon,
  Palette,
  Shield,
  Upload,
  Wallet,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type SettingItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  description: string;
} & (
  | { type: "switch"; value: boolean; onToggle: (value: boolean) => void }
  | { type: "value"; value: string }
  | {
      type: "select";
      value: string;
      options: { value: string; label: string }[];
      onChange: (value: string) => void;
    }
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
  const { t } = useTranslation();

  const language = useSettingsStore((state) => state.language);
  const currencyCode = useSettingsStore((state) => state.currencyCode);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setCurrency = useSettingsStore((state) => state.setCurrency);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [dailyReminderHour, setDailyReminderHour] = useState(20);
  const [dailyReminderMinute, setDailyReminderMinute] = useState(0);

  const loadPreferences = useCallback(async () => {
    const p = await notificationPreferences.getPreferences();
    const granted = await NotificationService.checkPermissions();

    // L'interrupteur reflète la réalité : si l'utilisateur a retiré la
    // permission dans les réglages du téléphone, il repasse à « désactivé »
    setNotificationsEnabled(p.notificationsEnabled && granted);
    setBudgetAlertsEnabled(p.budgetAlertsEnabled);
    setDailyReminderEnabled(p.dailyReminderEnabled && granted);
    setWarningThreshold(p.warningThreshold);
    setDailyReminderHour(p.dailyReminderHour);
    setDailyReminderMinute(p.dailyReminderMinute);

    // Remet le rappel en place si besoin (pas de doublon : même identifiant)
    if (granted && p.notificationsEnabled && p.dailyReminderEnabled) {
      await NotificationService.scheduleDailyReminder(
        p.dailyReminderHour,
        p.dailyReminderMinute,
      );
    }
  }, []);

  // Recharge les préférences à chaque focus : l'écran reste cohérent avec
  // l'état réel (permissions révoquées, réglages modifiés ailleurs).
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences]),
  );

  const formatTime = (hour: number, minute: number) =>
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const pickReminderTime = () => {
    void haptics.impact(haptics.ImpactFeedbackStyle.Light);
    pickTime({
      title: t("settings.reminderTimeTitle"),
      message: t("settings.reminderTimeMessage"),
      cancelLabel: t("common.cancel"),
      currentHour: dailyReminderHour,
      onPick: async (hour) => {
        setDailyReminderHour(hour);
        setDailyReminderMinute(0);
        await notificationPreferences.setDailyReminderTime(hour, 0);
        if (dailyReminderEnabled && notificationsEnabled) {
          await NotificationService.scheduleDailyReminder(hour, 0);
        }
      },
    });
  };

  const handleExportJSON = async () => {
    try {
      await saveTextFile(
        serializeBackup(),
        `wallet-backup-${timestampForFilename()}.json`,
        "application/json",
      );
      alert(t("export.successTitle"), t("export.successMessage"));
    } catch {
      alert(t("export.errorTitle"), t("export.errorMessage"));
    }
  };

  const handleExportCSV = async () => {
    if (!hasTransactions()) {
      alert(t("export.emptyTransactions"));
      return;
    }
    try {
      await saveTextFile(
        serializeTransactionsCSV(),
        `wallet-transactions-${timestampForFilename()}.csv`,
        "text/csv",
      );
      alert(t("export.successTitle"), t("export.successMessage"));
    } catch {
      alert(t("export.errorTitle"), t("export.errorMessage"));
    }
  };

  const handleImport = async () => {
    try {
      const picked = await pickTextFile([
        "application/json",
        "text/csv",
        "text/comma-separated-values",
        "text/plain",
        ".json",
        ".csv",
      ]);
      if (!picked) return;

      const isJSON =
        picked.name.toLowerCase().endsWith(".json") ||
        picked.content.trimStart().startsWith("{");

      let result: ImportResult;
      if (isJSON) {
        const payload = parseBackupJSON(picked.content);
        const mode = await chooseImportMode({
          title: t("import.title"),
          message: t("import.modeMessage"),
          cancelLabel: t("common.cancel"),
          mergeLabel: t("import.merge"),
          replaceLabel: t("import.replace"),
          mergeConfirmMessage: t("import.mergeConfirmMessage"),
          replaceConfirmMessage: t("import.replaceConfirmMessage"),
        });
        if (!mode) return;
        result = applyBackup(payload, mode);
      } else {
        result = importTransactionsCSV(picked.content);
      }

      await useAppStore.getState().refreshData();
      alert(
        t("import.successTitle"),
        t("import.successMessage", {
          categories: result.categories,
          transactions: result.transactions,
          budgets: result.budgets,
        }),
      );
    } catch {
      alert(t("import.errorTitle"), t("import.errorMessage"));
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: t("settings.appearance"),
      icon: Palette,
      items: [
        {
          key: "theme",
          icon: Moon,
          label: t("settings.darkMode"),
          description: isDark
            ? t("settings.darkEnabled")
            : t("settings.lightEnabled"),
          type: "switch",
          value: isDark,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            await setThemePreference(value ? "dark" : "light");
          },
        },
        {
          key: "language",
          icon: Languages,
          label: t("settings.language"),
          description: t("settings.languageDescription"),
          type: "select",
          value: language,
          options: LANGUAGES.map((l) => ({
            value: l.code,
            label: t(l.labelKey),
          })),
          onChange: async (value: string) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setLanguage(value as Parameters<typeof setLanguage>[0]);
          },
        },
        {
          key: "currency",
          icon: Wallet,
          label: t("settings.currency"),
          description: t("settings.currencyDescription"),
          type: "select",
          value: currencyCode,
          options: CURRENCIES.map((c) => ({
            value: c.code,
            label: c.name[language],
          })),
          onChange: async (value: string) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setCurrency(value);
          },
        },
      ],
    },
    {
      title: t("settings.notifications"),
      icon: Bell,
      items: [
        {
          key: "notifications-enabled",
          icon: Bell,
          label: t("settings.enableNotifications"),
          description: t("settings.allowLocalNotifications"),
          type: "switch",
          value: notificationsEnabled,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setNotificationsEnabled(value);
            await notificationPreferences.setNotificationsEnabled(value);
            if (value) {
              try {
                await NotificationService.requestPermissions();
              } catch {}
            }
          },
        },
        {
          key: "budget-alerts",
          icon: CalendarDays,
          label: t("settings.budgetAlerts"),
          description: t("settings.budgetAlertsDesc"),
          type: "switch",
          value: budgetAlertsEnabled,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setBudgetAlertsEnabled(value);
            await notificationPreferences.setBudgetAlertsEnabled(value);
          },
        },
        {
          key: "daily-reminder",
          icon: CalendarDays,
          label: t("settings.dailyReminder"),
          description: t("settings.everydayAt", {
            time: formatTime(dailyReminderHour, dailyReminderMinute),
          }),
          type: "switch",
          value: dailyReminderEnabled,
          onToggle: async (value: boolean) => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Light);
            setDailyReminderEnabled(value);
            await notificationPreferences.setDailyReminderEnabled(value);
            if (value) {
              await NotificationService.scheduleDailyReminder(
                dailyReminderHour,
                dailyReminderMinute,
              );
            } else {
              await NotificationService.cancelDailyReminders();
            }
          },
        },
        {
          key: "daily-reminder-time",
          icon: CalendarDays,
          label: t("settings.reminderTime"),
          description: t("settings.currentlyAt", {
            time: formatTime(dailyReminderHour, dailyReminderMinute),
          }),
          type: "action",
          onPress: pickReminderTime,
        },
        {
          key: "warning-threshold",
          icon: Info,
          label: t("settings.warningThreshold"),
          description: t("settings.alertAt", {
            percent: warningThreshold,
          }),
          type: "value",
          value: `${warningThreshold}%`,
        },
      ],
    },
    {
      title: t("settings.data"),
      icon: Database,
      items: [
        {
          key: "export-json",
          icon: FileJson,
          label: t("settings.exportJson"),
          description: t("settings.exportJsonDesc"),
          type: "action",
          onPress: handleExportJSON,
        },
        {
          key: "export-csv",
          icon: FileSpreadsheet,
          label: t("settings.exportCsv"),
          description: t("settings.exportCsvDesc"),
          type: "action",
          onPress: handleExportCSV,
        },
        {
          key: "import-data",
          icon: Upload,
          label: t("settings.importData"),
          description: t("settings.importDataDesc"),
          type: "action",
          onPress: handleImport,
        },
      ],
    },
    {
      title: t("settings.about"),
      icon: Info,
      items: [
        {
          key: "version",
          icon: Info,
          label: t("settings.version"),
          description: t("settings.appDescription"),
          type: "value",
          value: t("common.version"),
        },
        {
          key: "terms",
          icon: FileSignature,
          label: t("settings.terms"),
          description: t("settings.termsDesc"),
          type: "action",
          onPress: () => router.push("/legal/terms"),
        },
        {
          key: "privacy",
          icon: Shield,
          label: t("settings.privacy"),
          description: t("settings.privacyDesc"),
          type: "action",
          onPress: () => router.push("/legal/privacy"),
        },
      ],
    },
  ];

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <ThemedText variant="headline" weight="bold">
            {t("settings.title")}
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
  const { t } = useTranslation();
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
        {item.type === "select" && (
          <View style={styles.itemSelect}>
            <Select
              value={item.value}
              options={item.options}
              onChange={item.onChange}
              placeholder={t("common.select")}
            />
          </View>
        )}
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
  itemSelect: {
    marginTop: spacing.xs,
  },
  itemValue: {
    letterSpacing: 0.5,
  },
});
