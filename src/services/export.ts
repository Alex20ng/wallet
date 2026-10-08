import type { TransactionWithCategory, Category, Budget } from '../types';
import { formatCurrency, formatDate } from './currency';

export function exportToCSV(
  transactions: TransactionWithCategory[],
  categories: Category[],
  budgets: Budget[]
): string {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const budgetMap = new Map(budgets.map(b => [b.categoryId, b]));

  // Transactions CSV
  const txnHeaders = ['Date', 'Type', 'Catégorie', 'Montant', 'Note', 'Budget', 'Dépensé', 'Restant'];
  const txnRows = transactions.map(t => {
    const cat = categoryMap.get(t.categoryId);
    const budget = budgetMap.get(t.categoryId);
    const spent = budget ? getSpentForCategory(transactions, t.categoryId, budget.periodStart, budget.periodEnd) : 0;
    return [
      formatDate(t.date),
      t.type === 'income' ? 'Revenu' : 'Dépense',
      cat?.name || 'Inconnue',
      formatCurrency(t.amount, { showSign: true }),
      t.note || '',
      budget ? formatCurrency(budget.amount) : '',
      budget ? formatCurrency(spent) : '',
      budget ? formatCurrency(budget.amount - spent) : '',
    ].map(v => `"${v}"`).join(',');
  });

  // Categories CSV
  const catHeaders = ['Nom', 'Type', 'Icône', 'Couleur', 'Budget mensuel', 'Seuil alerte'];
  const catRows = categories.map(c => {
    const budget = budgetMap.get(c.id);
    return [
      c.name,
      c.type === 'expense' ? 'Dépense' : c.type === 'income' ? 'Revenu' : 'Les deux',
      c.icon,
      c.color,
      budget ? formatCurrency(budget.amount) : '',
      budget ? `${Math.round(budget.alertThreshold * 100)}%` : '',
    ].map(v => `"${v}"`).join(',');
  });

  // Budgets CSV
  const budHeaders = ['Catégorie', 'Montant', 'Période début', 'Période fin', 'Seuil alerte'];
  const budRows = budgets.map(b => {
    const cat = categoryMap.get(b.categoryId);
    return [
      cat?.name || 'Inconnue',
      formatCurrency(b.amount),
      formatDate(b.periodStart),
      formatDate(b.periodEnd),
      `${Math.round(b.alertThreshold * 100)}%`,
    ].map(v => `"${v}"`).join(',');
  });

  const sections = [
    '=== TRANSACTIONS ===',
    txnHeaders.join(','),
    ...txnRows,
    '',
    '=== CATÉGORIES ===',
    catHeaders.join(','),
    ...catRows,
    '',
    '=== BUDGETS ===',
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