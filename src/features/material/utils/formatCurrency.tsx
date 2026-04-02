import { formatCurrencyValue } from '@/shared/utils/formatters';

/**
 * Format currency value as plain text string with "đ" suffix
 * @param value - Numeric value to format
 * @returns Formatted string like "1,000 đ"
 */
export const formatCurrency = (value: number): string => {
    return `${formatCurrencyValue(value)} ₫`;
};
