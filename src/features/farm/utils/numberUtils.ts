/**
 * Format number with dots as thousand separators
 * @param num - Number, string, or null/undefined to format
 * @returns Formatted number string with dots as thousand separators (e.g., "1.000.000")
 */
export const formatNumber = (num: string | number | null | undefined): string => {
  if (num === null || num === undefined) return '';

  let numStr: string;
  if (typeof num === 'string') {
    // Remove all non-numeric characters
    numStr = num.replace(/\D/g, '');
  } else {
    numStr = num.toString();
  }

  if (!numStr) return '';

  // Add dots as thousand separators
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
