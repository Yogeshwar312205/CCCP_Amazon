/**
 * Shared formatting utilities used across customer and admin UI.
 * Import what you need: import { formatCurrency, formatDate } from '../utils/formatters';
 */

/**
 * Format a number as USD currency.
 * @param {number|string} amount
 * @returns {string}  e.g. "$1,299.99"
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Format an ISO date string for display.
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} [style='medium']
 * @returns {string}  e.g. "Oct 7, 2026"
 */
export const formatDate = (date, style = 'medium') => {
  if (!date) return 'N/A';
  const options = {
    short:  { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short',   day: 'numeric', year: 'numeric' },
    long:   { month: 'long',    day: 'numeric', year: 'numeric' },
  };
  return new Intl.DateTimeFormat('en-US', options[style] || options.medium).format(new Date(date));
};

/**
 * Format a date with time included.
 * @param {string|Date} date
 * @returns {string}  e.g. "Oct 7, 2026, 3:45 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Truncate a string to a max length, adding "..." if cut.
 * @param {string} text
 * @param {number} [max=100]
 * @returns {string}
 */
export const truncate = (text, max = 100) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

/**
 * Capitalise the first letter of every word.
 * @param {string} str
 * @returns {string}
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Return a percentage discount label.
 * @param {number} base   Original price
 * @param {number} sale   Sale price
 * @returns {string}  e.g. "23% off"
 */
export const discountPercent = (base, sale) => {
  if (!base || !sale || sale >= base) return '';
  const pct = Math.round(((base - sale) / base) * 100);
  return `${pct}% off`;
};
