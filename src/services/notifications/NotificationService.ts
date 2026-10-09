import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "reminders-v2";

const IDS = {
  dailyReminder: "daily-reminder",
  monthlyReport: "monthly-report",
} as const;

/** Les notifications locales planifiées ne sont pas disponibles sur le web. */
const isSupported = Platform.OS !== "web";

let configured = false;

/**
 * À appeler une fois au démarrage de l'app (par exemple dans app/_layout.tsx).
 * Définit l'affichage des notifications au premier plan et crée le canal Android.
 */
export async function configureNotifications(): Promise<void> {
  if (!isSupported || configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Rappels",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/** Demande la permission si nécessaire. Renvoie true si elle est accordée. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isSupported) return false;

  try {
    // Android 13+ : le canal doit exister avant la demande de permission
    await configureNotifications();

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.warn("[Notifications] Permission impossible à obtenir :", error);
    return false;
  }
}

/** Vérifie la permission sans afficher de demande à l'utilisateur. */
export async function hasNotificationPermission(): Promise<boolean> {
  if (!isSupported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    return current.granted;
  } catch {
    return false;
  }
}

/**
 * Rappel quotidien (par défaut à 20 h) pour enregistrer ses dépenses.
 * Renvoie true si le rappel est planifié.
 */
export async function scheduleDailyReminder(
  hour = 20,
  minute = 0,
): Promise<boolean> {
  if (!isSupported) return false;
  if (!(await requestNotificationPermission())) return false;

  try {
    await configureNotifications();
    await cancelDailyReminder(); // évite les doublons

    await Notifications.scheduleNotificationAsync({
      identifier: IDS.dailyReminder,
      content: {
        sound: "default",
        title: "Rappel Wallet",
        body: "N'oubliez pas d'enregistrer vos dépenses du jour.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch (error) {
    console.warn("[Notifications] Rappel quotidien non planifié :", error);
    return false;
  }
}

/**
 * Rapport mensuel (par défaut le 1er du mois à 9 h).
 * iOS : déclencheur de calendrier. Android : déclencheur mensuel.
 */
export async function scheduleMonthlyReport(
  day = 1,
  hour = 9,
  minute = 0,
): Promise<boolean> {
  if (!isSupported) return false;
  if (!(await requestNotificationPermission())) return false;

  try {
    await configureNotifications();
    await cancelMonthlyReport();

    await Notifications.scheduleNotificationAsync({
      identifier: IDS.monthlyReport,
      content: {
        sound: "default",
        title: "Votre résumé du mois",
        body: "Consultez le bilan de vos revenus et dépenses.",
      },
      trigger:
        Platform.OS === "ios"
          ? {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              day,
              hour,
              minute,
              repeats: true,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
              day,
              hour,
              minute,
              channelId: CHANNEL_ID,
            },
    });
    return true;
  } catch (error) {
    console.warn("[Notifications] Rapport mensuel non planifié :", error);
    return false;
  }
}

/** Alerte immédiate quand un budget approche de sa limite. */
export async function sendBudgetAlert(
  categoryName: string,
  percent: number,
): Promise<void> {
  if (!isSupported) return;
  if (!(await requestNotificationPermission())) return;

  try {
    await configureNotifications();
    await Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Budget bientôt atteint",
        body: `« ${categoryName} » : ${Math.round(percent)}% du budget utilisé.`,
      },
      trigger: null, // immédiat
    });
  } catch (error) {
    console.warn("[Notifications] Alerte de budget non envoyée :", error);
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder);
  } catch {
    // Rien à annuler
  }
}

export async function cancelMonthlyReport(): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(IDS.monthlyReport);
  } catch {
    // Rien à annuler
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("[Notifications] Annulation impossible :", error);
  }
}

/*
export async function scheduleTestNotification(seconds = 10): Promise<boolean> {
  if (!isSupported) return false;
  if (!(await requestNotificationPermission())) return false;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Test planifié",
        body: `Cette notification a été planifiée ${seconds} secondes plus tôt.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch (error) {
    console.warn("[Notifications] Test planifié impossible :", error);
    return false;
  }
}
*/

/**
 * Objet regroupant toutes les fonctions : permet d'écrire
 * `NotificationService.scheduleDailyReminder(...)` comme dans settings.tsx.
 */
export const NotificationService = {
  configure: configureNotifications,
  requestPermissions: requestNotificationPermission,
  hasPermission: hasNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminders: cancelDailyReminder,
  scheduleMonthlyReport,
  cancelMonthlyReport,
  sendBudgetAlert,
  cancelAll: cancelAllNotifications,
};

export default NotificationService;
