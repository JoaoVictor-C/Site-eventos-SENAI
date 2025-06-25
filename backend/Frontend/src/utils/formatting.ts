/**
 * Format a date to a localized string
 */
export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(d);
};

/**
 * Format a number as Brazilian currency (BRL)
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format a number with custom options
 */
export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat('pt-BR', options).format(value);
};
