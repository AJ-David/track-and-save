/**
 * General utility helpers.
 */

/**
 * Merge Tailwind classes conditionally.
 * Simple implementation — no external dependency needed.
 * @param  {...string} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a random UUID v4 (for demo data).
 * @returns {string}
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Get current month/year string.
 * @returns {string} e.g. '2026-11'
 */
export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get the start and end of a given month.
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {{ start: Date, end: Date }}
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Calculate percentage.
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
export function calcPercentage(part, total) {
  if (total === 0) return 0;
  return Math.min((part / total) * 100, 100);
}

