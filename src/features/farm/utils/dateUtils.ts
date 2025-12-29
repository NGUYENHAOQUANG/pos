/**
 * Format date as dd/mm/yyyy string
 * @param date - Date object to format
 * @returns Formatted date string (dd/mm/yyyy)
 */
export const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Parse date string from dd/mm/yyyy format to Date object
 * @param dateStr - Date string in dd/mm/yyyy format
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Format date and time for display in farm screens
 * @param date - Date object or date string to format
 * @param options - Formatting options
 * @returns Formatted date time string
 */
export interface FormatDateTimeOptions {
    /** Date separator: '/' for dd/mm/yyyy or '-' for dd-mm-yyyy. Default: '/' */
    dateSeparator?: '/' | '-';
    /** Show "(hiện tại)" label: true (always), false (never), 'auto' (only if today). Default: 'auto' */
    showCurrentLabel?: boolean | 'auto';
    /** Fallback text when date is null/undefined. Default: 'dd-mm-yyyy, hr:mm (hiện tại)' */
    fallbackText?: string;
}

export const formatDateTime = (
    date: Date | string | null | undefined,
    options: FormatDateTimeOptions = {}
): string => {
    const {
        dateSeparator = '/',
        showCurrentLabel = 'auto',
        fallbackText = 'dd/mm/yyyy, hr:mm (hiện tại)',
    } = options;

    // Handle null/undefined
    if (!date) {
        return fallbackText;
    }

    // Convert to Date if string
    const dateObj = date instanceof Date ? date : new Date(date);

    // Validate date
    if (isNaN(dateObj.getTime())) {
        return fallbackText;
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // Build date part
    const datePart = `${day}${dateSeparator}${month}${dateSeparator}${year}`;
    const timePart = `${hours}:${minutes}`;

    // Handle current label
    let currentLabel = '';
    if (showCurrentLabel === true) {
        currentLabel = ' (hiện tại)';
    } else if (showCurrentLabel === 'auto') {
        // Only show "(hiện tại)" if date/time exactly matches current date/time (not just the day)
        // This means if user changes the date/time, even if it's still today, it won't show "(hiện tại)"
        const now = new Date();
        const isExactCurrentDateTime =
            dateObj.getFullYear() === now.getFullYear() &&
            dateObj.getMonth() === now.getMonth() &&
            dateObj.getDate() === now.getDate() &&
            dateObj.getHours() === now.getHours() &&
            dateObj.getMinutes() === now.getMinutes();
        currentLabel = isExactCurrentDateTime ? ' (hiện tại)' : '';
    }

    return `${datePart}, ${timePart}${currentLabel}`;
};

/**
 * Compare two time strings in "HH:mm" format
 * @param timeA - First time string (e.g., "09:30")
 * @param timeB - Second time string (e.g., "10:00")
 * @returns Negative if timeA < timeB, positive if timeA > timeB, 0 if equal
 */
export const compareTime = (timeA: string, timeB: string): number => {
    const [hoursA, minutesA] = timeA.split(':').map(Number);
    const [hoursB, minutesB] = timeB.split(':').map(Number);

    const totalMinutesA = hoursA * 60 + minutesA;
    const totalMinutesB = hoursB * 60 + minutesB;

    return totalMinutesA - totalMinutesB;
};
