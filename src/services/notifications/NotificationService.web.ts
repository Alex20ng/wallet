// Stub web (PWA) du service de notifications.
// Les notifications locales/push ne sont pas supportées sur le web ici :
// toutes les méthodes sont des no-op, sans importer expo-notifications.
// Les préférences (notificationPreferences) restent fonctionnelles et
// persistées, mais les interrupteurs affichent « désactivé » (permission
// refusée) et aucune notification n'est planifiée.

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

interface NoopSubscription {
  remove(): void;
}

const noopSubscription = (): NoopSubscription => ({ remove: () => {} });

export class NotificationService {
  static async configure() {}

  static async requestPermissions() {
    return false;
  }

  static async checkPermissions() {
    return false;
  }

  static async cancelDailyReminders() {}

  static async scheduleDailyReminder(_hour: number, _minute: number) {}

  static async sendBudgetAlert(
    _payload: BudgetAlertPayload,
    _title: string,
    _body: string,
  ) {}

  static addNotificationReceivedListener(_listener: (event: unknown) => void) {
    return noopSubscription();
  }

  static addNotificationResponseReceivedListener(
    _listener: (response: unknown) => void,
  ) {
    return noopSubscription();
  }
}
