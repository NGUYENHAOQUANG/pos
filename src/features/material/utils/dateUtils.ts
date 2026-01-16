/**
 * @file dateUtils.ts
 * @description Date formatting utilities for material module
 * Reuses farm dateUtils for consistency
 */
export { formatDate, formatDateTime, parseDate } from '@/features/farm/utils/dateUtils';

/**
 * Format date as dd/mm/yyyy string (alias for consistency)
 * @param date - Date object to format
 * @returns Formatted date string (dd/mm/yyyy)
 */
export const formatMaterialDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Format date and time as HH:mm dd/mm/yyyy string
 * @param date - Date object to format
 * @returns Formatted date time string (HH:mm dd/mm/yyyy)
 */
export const formatMaterialDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
};
