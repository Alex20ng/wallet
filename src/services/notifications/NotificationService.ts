import { haptics } from "@/hooks/use-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const NOTIFICATION_CHANNEL_ID = "budget-alerts";
const DAILY_REMINDER_ID = "daily-reminder";

export interface BudgetAlertPayload {
  type:
    | "budget-warning"
    | "budget-reached"
    | "budget-exceeded"
    | "daily-reminder";
  categoryId?: string;
  categoryName?: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  exceeded?: number;
  periodStart?: number;
  periodEnd?: number;
}

const isDev = __DEV__;

function log(...args: any[]) {
  if (isDev) {
    console.log("[NotificationService]", ...args);
  }
}

export class NotificationService {
  private static initialized = false;

  static async configure() {
    if (this.initialized) return;
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          NOTIFICATION_CHANNEL_ID,
          {
            name: "Alertes budgétaires",
            description: "Notifications d'alerte pour vos budgets",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
            showBadge: false,
          },
        );
        log("Android channel configured");
      }
      this.initialized = true;
      log("Configured");
    } catch (e) {
      log("Configure error", e);
    }
  }

  static async requestPermissions() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowSound: true,
            allowBadge: false,
          },
        });
        finalStatus = status;
      }
      log("Permissions", finalStatus);
      return finalStatus === "granted";
    } catch (e) {
      log("requestPermissions error", e);
      return false;
    }
  }

  static async checkPermissions() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (e) {
      log("checkPermissions error", e);
      return false;
    }
  }

  static async cancelDailyReminders() {
    try {
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
      log("Cancelled daily reminder");
    } catch (e) {
      log("cancelDailyReminders error", e);
    }
  }

  static async scheduleDailyReminder(hour: number, minute: number) {
    try {
      await this.cancelDailyReminders();
      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_REMINDER_ID,
        content: {
          title: "Enregistrez vos dépenses",
          body: "Avez-vous eu des dépenses aujourd'hui ? Enregistrez-les en 5 secondes.",
          sound: "default",
          data: {
            type: "daily-reminder",
            url: "/(tabs)/transactions",
          } as Record<string, unknown>,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
      log("Scheduled daily reminder", hour, minute);
    } catch (e) {
      log("scheduleDailyReminder error", e);
    }
  }

  static async sendBudgetAlert(
    payload: BudgetAlertPayload,
    title: string,
    body: string,
  ) {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        log("No permission, skipping alert");
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          data: payload as unknown as Record<string, unknown>,
        },
        trigger: null,
      });
      await haptics.notification(haptics.NotificationFeedbackType.Warning);
      log("Sent budget alert", payload.type);
    } catch (e) {
      log("sendBudgetAlert error", e);
    }
  }

  static addNotificationReceivedListener(
    listener: (event: Notifications.Notification) => void,
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}
