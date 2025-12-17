import { Transaction } from '@shared/types';
import { ScopeWithIcon } from '@/lib/store';
import { format, parseISO } from 'date-fns';
export function generateCSV(transactions: Transaction[], scopes: ScopeWithIcon[], currency: string): string {
  const scopesMap = new Map(scopes.map(s => [s.id, s.name]));
  const headers = ['Date', 'Category', `Amount (${currency})`, 'Description'];
  const rows = transactions.map(tx => {
    const date = format(parseISO(tx.date), 'yyyy-MM-dd HH:mm:ss');
    const category = scopesMap.get(tx.scopeId) || 'Uncategorized';
    const amount = tx.amount.toFixed(2);
    const description = tx.description || '';
    return [date, category, amount, description].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}