import type { TransactionWithCategory, Category, Budget } from '../types';
import { translate } from '../i18n';
import { formatCurrency, formatDate } from './currency';

export function exportToCSV(
  transactions: TransactionWithCategory[],
  categories: Category[],
  budgets: Budget[]
): string {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const budgetMap = new Map(budgets.map(b => [b.categoryId, b]));

  // Transactions CSV
  const txnHeaders = [
    translate('export.colDate'),
    translate('export.colType'),
    translate('export.colCategory'),
    translate('export.colAmount'),
    translate('export.colNote'),
    translate('export.colBudget'),
    translate('export.colSpent'),
    translate('export.colRemaining'),
  ];
  const txnRows = transactions.map(t => {
    const cat = categoryMap.get(t.categoryId);
    const budget = budgetMap.get(t.categoryId);
    const spent = budget ? getSpentForCategory(transactions, t.categoryId, budget.periodStart, budget.periodEnd) : 0;
    return [
      formatDate(t.date),
      t.type === 'income' ? translate('common.income') : translate('common.expense'),
      cat?.name || translate('common.unknown'),
      formatCurrency(t.amount, { showSign: true }),
      t.note || '',
      budget ? formatCurrency(budget.amount) : '',
      budget ? formatCurrency(spent) : '',
      budget ? formatCurrency(budget.amount - spent) : '',
    ].map(v => `"${v}"`).join(',');
  });

  // Categories CSV
  const catHeaders = [
    translate('export.colName'),
    translate('export.colType'),
    translate('export.colIcon'),
    translate('export.colColor'),
    translate('export.colMonthlyBudget'),
    translate('export.colAlertThreshold'),
  ];
  const catRows = categories.map(c => {
    const budget = budgetMap.get(c.id);
    return [
      c.name,
      c.type === 'expense'
        ? translate('common.expense')
        : c.type === 'income'
          ? translate('common.income')
          : translate('common.both'),
      c.icon,
      c.color,
      budget ? formatCurrency(budget.amount) : '',
      budget ? `${Math.round(budget.alertThreshold * 100)}%` : '',
    ].map(v => `"${v}"`).join(',');
  });

  // Budgets CSV
  const budHeaders = [
    translate('export.colCategory'),
    translate('export.colAmount'),
    translate('export.colPeriodStart'),
    translate('export.colPeriodEnd'),
    translate('export.colAlertThreshold'),
  ];
  const budRows = budgets.map(b => {
    const cat = categoryMap.get(b.categoryId);
    return [
      cat?.name || translate('common.unknown'),
      formatCurrency(b.amount),
      formatDate(b.periodStart),
      formatDate(b.periodEnd),
      `${Math.round(b.alertThreshold * 100)}%`,
    ].map(v => `"${v}"`).join(',');
  });

  const sections = [
    translate('export.sectionTransactions'),
    txnHeaders.join(','),
    ...txnRows,
    '',
    translate('export.sectionCategories'),
    catHeaders.join(','),
    ...catRows,
    '',
    translate('export.sectionBudgets'),
    budHeaders.join(','),
    ...budRows,
  ];

  return sections.join('\n');
}

function getSpentForCategory(
  transactions: TransactionWithCategory[],
  categoryId: string,
  periodStart: number,
  periodEnd: number
): number {
  return transactions
    .filter(t => t.categoryId === categoryId && t.type === 'expense' && t.date >= periodStart && t.date <= periodEnd)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function exportToJSON(
  transactions: TransactionWithCategory[],
  categories: Category[],
  budgets: Budget[]
): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: { transactions, categories, budgets },
  }, null, 2);
}

export async function shareExport(content: string, filename: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'share' in navigator) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Export Wallet' });
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function downloadExport(content: string, filename: string, mimeType: string = 'text/csv'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}