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
 * Format date as dd/mm/yyyy HH:mm string
 * @param date - Date object to format
 * @returns Formatted date string (dd/mm/yyyy HH:mm)
 */
export const formatDateWithTime = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Parse date string from dd/mm/yyyy or dd/mm/yyyy HH:mm format to Date object
 * @param dateStr - Date string
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
    // Handle standard ISO strings or other parseable formats first if they don't match our custom format structure
    if (dateStr.includes('T') || dateStr.includes('-')) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
    }

    // Handle dd/mm/yyyy HH:mm
    if (dateStr.includes(' ') && dateStr.includes(':')) {
        const [datePart, timePart] = dateStr.split(' ');
        if (datePart && timePart) {
            const [day, month, year] = datePart.split('/').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            return new Date(year, month - 1, day, hours, minutes);
        }
    }

    // Handle dd/mm/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
    }

    // Fallback
    return new Date(dateStr);
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
    /** Show time part: true (show time), false (only date). Default: true */
    showTime?: boolean;
    /** Show "(hiện tại)" label: true (always), false (never), 'auto' (only if today). Default: 'auto' */
    showCurrentLabel?: boolean | 'auto';
    /** Fallback text when date is null/undefined. Default: 'dd/mm/yyyy, hr:mm (hiện tại)' or 'dd/mm/yyyy' based on showTime */
    fallbackText?: string;
}

export const formatDateTime = (
    date: Date | string | null | undefined,
    options: FormatDateTimeOptions = {}
): string => {
    const {
        dateSeparator = '/',
        showTime = true,
        showCurrentLabel = 'auto',
        fallbackText,
    } = options;

    // Default fallback text based on showTime
    const defaultFallbackText = showTime
        ? `dd${dateSeparator}mm${dateSeparator}yyyy, hr:mm (hiện tại)`
        : `dd${dateSeparator}mm${dateSeparator}yyyy`;
    const finalFallbackText = fallbackText || defaultFallbackText;

    // Handle null/undefined
    if (!date) {
        return finalFallbackText;
    }

    // Convert to Date if string
    const dateObj = date instanceof Date ? date : new Date(date);

    // Validate date
    if (isNaN(dateObj.getTime())) {
        return finalFallbackText;
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    // Build date part
    const datePart = `${day}${dateSeparator}${month}${dateSeparator}${year}`;

    // Handle current label
    let currentLabel = '';
    if (showCurrentLabel === true) {
        currentLabel = ' (hiện tại)';
    } else if (showCurrentLabel === 'auto') {
        const now = new Date();
        if (showTime) {
            // Only show "(hiện tại)" if date/time exactly matches current date/time (not just the day)
            const isExactCurrentDateTime =
                dateObj.getFullYear() === now.getFullYear() &&
                dateObj.getMonth() === now.getMonth() &&
                dateObj.getDate() === now.getDate() &&
                dateObj.getHours() === now.getHours() &&
                dateObj.getMinutes() === now.getMinutes();
            currentLabel = isExactCurrentDateTime ? ' (hiện tại)' : '';
        } else {
            // Only show "(hiện tại)" if date matches today
            const isToday =
                dateObj.getFullYear() === now.getFullYear() &&
                dateObj.getMonth() === now.getMonth() &&
                dateObj.getDate() === now.getDate();
            currentLabel = isToday ? ' (hiện tại)' : '';
        }
    }

    // Build result based on showTime
    if (showTime) {
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const timePart = `${hours}:${minutes}`;
        return `${datePart}, ${timePart}${currentLabel}`;
    } else {
        return `${datePart}${currentLabel}`;
    }
};

/**
 * Format date to YYYY-MM-DD (local date parts) — dùng cho API CreateAtFrom/CreateAtTo để param khớp DateRangeFilter.
 */
export const toDateOnlyISO = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Start of day UTC cho ngày calendar (local): YYYY-MM-DDT00:00:00.000Z — CreateAtFrom khớp ngày user chọn.
 */
export const toCreateAtFromISO = (date: Date): string => `${toDateOnlyISO(date)}T00:00:00.000Z`;

/**
 * End of day UTC cho ngày calendar (local): YYYY-MM-DDT23:59:59.999Z — CreateAtTo khớp ngày user chọn.
 */
export const toCreateAtToISO = (date: Date): string => `${toDateOnlyISO(date)}T23:59:59.999Z`;

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
