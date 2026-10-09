import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NOTIFICATIONS_ENABLED = "@budget_app_notifications_enabled";
const KEY_BUDGET_ALERTS_ENABLED = "@budget_app_budget_alerts_enabled";
const KEY_DAILY_REMINDER_ENABLED = "@budget_app_daily_reminder_enabled";
const KEY_WARNING_THRESHOLD = "@budget_app_warning_threshold";
const KEY_DAILY_REMINDER_HOUR = "@budget_app_daily_reminder_hour";
const KEY_DAILY_REMINDER_MINUTE = "@budget_app_daily_reminder_minute";
const KEY_SENT_ALERTS = "@budget_app_sent_alerts";

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  budgetAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  warningThreshold: number; // percentage
  dailyReminderHour: number;
  dailyReminderMinute: number;
}

export interface SentAlertKey {
  periodStart: number;
  categoryId?: string;
  alertType: string; // warning, reached, exceeded
}

class NotificationPreferencesStore {
  async getPreferences(): Promise<NotificationPreferences> {
    const [enabled, budgetAlerts, daily, threshold, hour, minute] =
      await Promise.all([
        AsyncStorage.getItem(KEY_NOTIFICATIONS_ENABLED),
        AsyncStorage.getItem(KEY_BUDGET_ALERTS_ENABLED),
        AsyncStorage.getItem(KEY_DAILY_REMINDER_ENABLED),
        AsyncStorage.getItem(KEY_WARNING_THRESHOLD),
        AsyncStorage.getItem(KEY_DAILY_REMINDER_HOUR),
        AsyncStorage.getItem(KEY_DAILY_REMINDER_MINUTE),
      ]);

    return {
      notificationsEnabled: enabled === null ? true : enabled === "true",
      budgetAlertsEnabled:
        budgetAlerts === null ? true : budgetAlerts === "true",
      dailyReminderEnabled: daily === null ? false : daily === "true",
      warningThreshold: threshold ? parseInt(threshold, 10) : 80,
      dailyReminderHour: hour ? parseInt(hour, 10) : 20,
      dailyReminderMinute: minute ? parseInt(minute, 10) : 0,
    };
  }

  async setNotificationsEnabled(enabled: boolean) {
    await AsyncStorage.setItem(
      KEY_NOTIFICATIONS_ENABLED,
      enabled ? "true" : "false",
    );
  }

  async setBudgetAlertsEnabled(enabled: boolean) {
    await AsyncStorage.setItem(
      KEY_BUDGET_ALERTS_ENABLED,
      enabled ? "true" : "false",
    );
  }

  async setDailyReminderEnabled(enabled: boolean) {
    await AsyncStorage.setItem(
      KEY_DAILY_REMINDER_ENABLED,
      enabled ? "true" : "false",
    );
  }

  async setWarningThreshold(threshold: number) {
    await AsyncStorage.setItem(KEY_WARNING_THRESHOLD, threshold.toString());
  }

  async setDailyReminderTime(hour: number, minute: number) {
    await AsyncStorage.multiSet([
      [KEY_DAILY_REMINDER_HOUR, hour.toString()],
      [KEY_DAILY_REMINDER_MINUTE, minute.toString()],
    ]);
  }

  private getAlertKey(key: SentAlertKey): string {
    const cat = key.categoryId || "global";
    return `${KEY_SENT_ALERTS}:${key.periodStart}:${cat}:${key.alertType}`;
  }

  async hasSentAlert(key: SentAlertKey): Promise<boolean> {
    const k = this.getAlertKey(key);
    const val = await AsyncStorage.getItem(k);
    return val === "sent";
  }

  async markAlertSent(key: SentAlertKey) {
    const k = this.getAlertKey(key);
    await AsyncStorage.setItem(k, "sent");
  }

  async clearSentAlertsForPeriod(periodStart: number) {
    const keys = await AsyncStorage.getAllKeys();
    const periodKeys = keys.filter(
      (k) => k.startsWith(KEY_SENT_ALERTS) && k.includes(`:${periodStart}:`),
    );
    if (periodKeys.length > 0) {
      await AsyncStorage.multiRemove(periodKeys);
    }
  }
}

export const notificationPreferences = new NotificationPreferencesStore();
