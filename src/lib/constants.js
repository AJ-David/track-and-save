/**
 * Application-wide constants for SpendWise.
 */

export const APP_NAME = 'SpendWise';

export const CURRENCIES = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
};

export const DEFAULT_CURRENCY = 'NGN';

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316' },
  { id: 'transport', label: 'Transportation', color: '#3b82f6' },
  { id: 'housing', label: 'Housing & Rent', color: '#8b5cf6' },
  { id: 'utilities', label: 'Utilities', color: '#06b6d4' },
  { id: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', color: '#f59e0b' },
  { id: 'health', label: 'Health & Medical', color: '#10b981' },
  { id: 'education', label: 'Education', color: '#6366f1' },
  { id: 'personal', label: 'Personal Care', color: '#14b8a6' },
  { id: 'insurance', label: 'Insurance', color: '#64748b' },
  { id: 'savings', label: 'Savings & Investment', color: '#22c55e' },
  { id: 'other', label: 'Other', color: '#94a3b8' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', color: '#10b981' },
  { id: 'freelance', label: 'Freelance', color: '#22c55e' },
  { id: 'business', label: 'Business', color: '#059669' },
  { id: 'investment', label: 'Investment Returns', color: '#14b8a6' },
  { id: 'gift', label: 'Gift', color: '#f59e0b' },
  { id: 'other_income', label: 'Other Income', color: '#94a3b8' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'mobile_money', label: 'Mobile Money' },
  { id: 'other', label: 'Other' },
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'transactions', label: 'Transactions', path: '/transactions' },
  { id: 'budgets', label: 'Budgets', path: '/budgets' },
  { id: 'savings', label: 'Savings Goals', path: '/savings' },
  { id: 'analytics', label: 'Analytics', path: '/analytics' },
  { id: 'settings', label: 'Settings', path: '/settings' },
];

