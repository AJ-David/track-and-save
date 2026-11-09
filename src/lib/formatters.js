/**
 * Utility functions for formatting currency, dates and numbers.
 */
import { CURRENCIES, DEFAULT_CURRENCY } from './constants';

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currencyCode - e.g. 'NGN', 'USD'
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Format a date string into a human-readable format.
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} style
 * @returns {string}
 */
export function formatDate(date, style = 'medium') {
  const d = new Date(date);
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' },
  };
  return d.toLocaleDateString('en-US', options[style] || options.medium);
}

/**
 * Format a number with compact notation for large values.
 * @param {number} num
 * @returns {string}
 */
export function formatCompactNumber(num) {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get percentage with sign.
 * @param {number} value
 * @returns {string}
 */
export function formatPercentage(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

