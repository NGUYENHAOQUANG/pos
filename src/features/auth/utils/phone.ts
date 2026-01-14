/**
 * @file phone.ts
 * @description Utilities for formatting auth-related phone numbers
 */

/**
 * Format a phone number for display in auth screens.
 * Example: "0908456789" -> "0908 456 789"
 */
export const formatAuthPhoneDisplay = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) {
        return '';
    }

    if (cleaned.length <= 4) {
        return cleaned;
    }

    if (cleaned.length <= 7) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }

    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
};
