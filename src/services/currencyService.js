/**
 * Official Currency Conversion & Exchange Rate Service for Track & Save (T&S).
 * Supports official central bank baseline rates + live market API fetching with fallback.
 */

// Baseline official market rates anchored to 1 USD
export const OFFICIAL_RATES_TO_USD = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.785,
  NGN: 1485.0,
  CAD: 1.36,
  JPY: 154.5,
  AUD: 1.53,
};

const STORAGE_KEY_RATES = 'spendwise_exchange_rates';
const STORAGE_KEY_TIMESTAMP = 'spendwise_rates_timestamp';
const STORAGE_KEY_BASE_CURRENCY = 'spendwise_base_currency';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Get active rates (from local storage cache or fallback baseline).
 */
export function getActiveRates() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_RATES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && parsed.USD === 1.0) {
        return { ...OFFICIAL_RATES_TO_USD, ...parsed };
      }
    }
  } catch {
    // ignore json parse errors
  }
  return OFFICIAL_RATES_TO_USD;
}

/**
 * Get user's base ledger currency. Defaults to NGN or stored preference.
 */
export function getBaseCurrency() {
  try {
    return localStorage.getItem(STORAGE_KEY_BASE_CURRENCY) || 'NGN';
  } catch {
    return 'NGN';
  }
}

/**
 * Set user's base ledger currency.
 */
export function setBaseCurrency(code) {
  try {
    if (code) {
      localStorage.setItem(STORAGE_KEY_BASE_CURRENCY, code);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Calculate the exchange rate multiplier from one currency to another.
 * E.g. getExchangeRate('NGN', 'USD') => ~0.000673 (1485 NGN per USD)
 * E.g. getExchangeRate('USD', 'NGN') => 1485
 */
export function getExchangeRate(fromCode = 'NGN', toCode = 'USD') {
  if (!fromCode || !toCode || fromCode === toCode) return 1.0;

  const rates = getActiveRates();
  const fromRate = rates[fromCode] || OFFICIAL_RATES_TO_USD[fromCode] || 1.0;
  const toRate = rates[toCode] || OFFICIAL_RATES_TO_USD[toCode] || 1.0;

  // Convert via USD anchor: (1 / fromRate) * toRate
  return toRate / fromRate;
}

/**
 * Convert an amount from one currency to another using official rates.
 */
export function convertAmount(amount, fromCode, toCode) {
  if (amount === null || amount === undefined || isNaN(amount)) return 0;
  const numeric = Number(amount);
  if (!fromCode || !toCode || fromCode === toCode) return numeric;

  const rate = getExchangeRate(fromCode, toCode);
  return numeric * rate;
}

/**
 * Format a human-readable exchange rate string.
 * E.g. formatExchangeRate('USD', 'NGN') => "1 USD ≈ ₦1,485.00"
 */
export function formatExchangeRate(fromCode = 'USD', toCode = 'NGN') {
  const rate = getExchangeRate(fromCode, toCode);
  const formattedRate = rate >= 100
    ? rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return `1 ${fromCode} ≈ ${formattedRate} ${toCode}`;
}

/**
 * Asynchronously fetch live exchange rates from the open public API.
 * Fails gracefully to official fallback rates if offline or blocked.
 */
export async function fetchLiveExchangeRates() {
  try {
    const lastFetch = Number(localStorage.getItem(STORAGE_KEY_TIMESTAMP) || 0);
    const now = Date.now();
    if (now - lastFetch < CACHE_TTL_MS) {
      return getActiveRates();
    }

    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    if (data && data.rates && typeof data.rates === 'object') {
      const mergedRates = {
        ...OFFICIAL_RATES_TO_USD,
        ...data.rates,
        USD: 1.0,
      };
      localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(mergedRates));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, String(now));
      return mergedRates;
    }
  } catch (err) {
    // Network isolated or offline: use robust official baseline rates
    console.debug('Using official baseline exchange rates:', err.message);
  }
  return OFFICIAL_RATES_TO_USD;
}

