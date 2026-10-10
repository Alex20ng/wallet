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
        categoryName = "catégorie",
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
          const body = `Budget dépassé de ${formatCurrency(exceeded)} dans la catégorie ${categoryName}.`;
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
            "Budget dépassé",
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
          const body = `Vous avez atteint le plafond de votre budget ${categoryName}.`;
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
            "Budget atteint",
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
          const body = `Attention, vous avez consommé ${Math.round(ratio)}% de votre budget ${categoryName} ce mois-ci.`;
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
            "Alerte budgétaire",
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
