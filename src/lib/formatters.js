/**
 * Utility functions for formatting currency, dates and numbers.
 */
import { CURRENCIES, DEFAULT_CURRENCY } from './constants';
import { convertAmount, getBaseCurrency } from '../services/currencyService';

/**
 * Format a number as currency, automatically converting from the base currency
 * if the display currency differs using official exchange rates.
 * @param {number} amount - Amount in base currency (or source currency)
 * @param {string} currencyCode - Target display currency (e.g. 'USD', 'EUR', 'NGN')
 * @param {string|null} fromCurrencyCode - Source currency. If omitted, uses active base currency.
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, fromCurrencyCode = null) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const sourceCode = fromCurrencyCode || getBaseCurrency();

  // Convert amount from base/source currency to display currency
  const converted = convertAmount(amount, sourceCode, currency.code);

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${currency.symbol}${Number(converted).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Format a number as currency directly without conversion (e.g. if already converted).
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatDirectCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  return formatCurrency(amount, currencyCode, currencyCode);
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

