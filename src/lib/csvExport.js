import { formatDate } from './formatters';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from './constants';

/**
 * Convert transaction objects into a CSV string and trigger browser download.
 * @param {Array} transactions
 * @param {string} currencyCode
 */
export function exportTransactionsToCSV(transactions = [], currencyCode = 'NGN') {
  if (!transactions.length) {
    throw new Error('No transactions available to export.');
  }

  const getCategoryLabel = (type, id) => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find((c) => c.id === id)?.label || id;
  };

  const getPaymentLabel = (id) => {
    return PAYMENT_METHODS.find((p) => p.id === id)?.label || id;
  };

  // CSV Headers
  const headers = [
    'Date',
    'Description',
    'Type',
    'Category',
    'Payment Method',
    'Amount',
    'Currency',
  ];

  // Map rows
  const rows = transactions.map((t) => [
    t.date || '',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.type || 'expense',
    `"${getCategoryLabel(t.type, t.category)}"`,
    `"${getPaymentLabel(t.payment_method)}"`,
    t.amount !== undefined ? t.amount : 0,
    currencyCode,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Create Blob & trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `spendwise_transactions_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

