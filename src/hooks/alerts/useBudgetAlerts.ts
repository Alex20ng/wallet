import { translate } from "@/i18n";
import { formatCurrency } from "@/services/currency";
import { NotificationService } from "@/services/notifications/NotificationService";
import {
  notificationPreferences,
  SentAlertKey,
} from "@/storage/notificationPreferences";
import { useCallback } from "react";

export interface BudgetCheckParams {
  categoryId?: string;
  categoryName?: string;
  budget: number; // cents
  spent: number; // cents
  periodStart: number;
  periodEnd: number;
}

const isDev = __DEV__;

function log(...args: any[]) {
  if (isDev) console.log("[BudgetAlerts]", ...args);
}

export function useBudgetAlerts() {
  const checkBudget = useCallback(async (params: BudgetCheckParams) => {
    try {
      const prefs = await notificationPreferences.getPreferences();
      if (!prefs.notificationsEnabled || !prefs.budgetAlertsEnabled) {
        log("Alerts disabled");
        return;
      }
      const {
        categoryId,
        categoryName = translate("notifications.defaultCategory"),
        budget,
        spent,
        periodStart,
        periodEnd,
      } = params;
      if (budget <= 0) return;

      const ratio = (spent / budget) * 100;
      const exceeded = spent > budget ? spent - budget : 0;
      const remaining = Math.max(0, budget - spent);

      if (spent > budget) {
        const key: SentAlertKey = {
          periodStart,
          categoryId,
          alertType: "exceeded",
        };
        if (!(await notificationPreferences.hasSentAlert(key))) {
          const body = translate("notifications.budgetExceededBody", {
            amount: formatCurrency(exceeded),
            category: categoryName,
          });
          await NotificationService.sendBudgetAlert(
            {
              type: "budget-exceeded",
              categoryId,
              categoryName,
              budget,
              spent,
              exceeded,
              periodStart,
              periodEnd,
            },
            translate("notifications.budgetExceededTitle"),
            body,
          );
          await notificationPreferences.markAlertSent(key);
        }
        return;
      }

      if (ratio >= 100) {
        const key: SentAlertKey = {
          periodStart,
          categoryId,
          alertType: "reached",
        };
        if (!(await notificationPreferences.hasSentAlert(key))) {
          const body = translate("notifications.budgetReachedBody", {
            category: categoryName,
          });
          await NotificationService.sendBudgetAlert(
            {
              type: "budget-reached",
              categoryId,
              categoryName,
              budget,
              spent,
              remaining,
              periodStart,
              periodEnd,
            },
            translate("notifications.budgetReachedTitle"),
            body,
          );
          await notificationPreferences.markAlertSent(key);
        }
        return;
      }

      if (ratio >= prefs.warningThreshold) {
        const key: SentAlertKey = {
          periodStart,
          categoryId,
          alertType: "warning",
        };
        if (!(await notificationPreferences.hasSentAlert(key))) {
          const body = translate("notifications.budgetWarningBody", {
            percent: Math.round(ratio),
            category: categoryName,
          });
          await NotificationService.sendBudgetAlert(
            {
              type: "budget-warning",
              categoryId,
              categoryName,
              budget,
              spent,
              remaining,
              periodStart,
              periodEnd,
            },
            translate("notifications.budgetWarningTitle"),
            body,
          );
          await notificationPreferences.markAlertSent(key);
        }
      }
    } catch (e) {
      log("checkBudget error", e);
    }
  }, []);

  return { checkBudget };
}
