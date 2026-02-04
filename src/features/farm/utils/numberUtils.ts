/**
 * Format number with dots as thousand separators
 * @param num - Number, string, or null/undefined to format
 * @returns Formatted number string with dots as thousand separators (e.g., "1.000.000")
 */
export const formatNumber = (num: string | number | null | undefined): string => {
    if (num === null || num === undefined) return '';

    let numValue: number;
    if (typeof num === 'string') {
        const cleaned = num.replace(/[^\d.]/g, '');
        numValue = parseFloat(cleaned);
    } else {
        numValue = num;
    }

    if (isNaN(numValue)) return '';

    const rounded = Math.round(numValue);

    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
