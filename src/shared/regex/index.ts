/**
 * @file Shared regex patterns for input validation and formatting
 */

/** Only digits (0-9) */
export const INTEGER_REGEX = /^[0-9]*$/;

/** Digits with at most one decimal point (e.g. 123.45) */
export const DECIMAL_REGEX = /^[0-9]*\.?[0-9]*$/;

/** Letters only (a-z, A-Z, Vietnamese characters) */
export const LETTERS_ONLY_REGEX = /^[a-zA-ZÀ-ỹ\s]*$/;

/** Alphanumeric (letters + digits) */
export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;

/** Phone number format (digits, optional +, spaces, dashes) */
export const PHONE_REGEX = /^[+]?[0-9\s-]*$/;

/** Email format */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** No special characters (letters, digits, spaces, Vietnamese) */
export const NO_SPECIAL_CHARS_REGEX = /^[a-zA-ZÀ-ỹ0-9\s]*$/;

/**
 * Filter functions — used by Input component internally.
 * These return the filtered string (or null to reject).
 */
export const InputFilters = {
    /** Keep only digits */
    integer: (text: string): string => text.replace(/[^0-9]/g, ''),

    /** Keep digits and at most one decimal point (dot cannot be first) */
    decimal: (text: string): string => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        // Remove leading dots
        const noLeadingDot = cleaned.replace(/^\.+/, '');
        const parts = noLeadingDot.split('.');
        if (parts.length <= 2) return noLeadingDot;
        // Keep only first decimal point
        return parts[0] + '.' + parts.slice(1).join('');
    },

    /** Test text against a regex pattern — returns text if valid, null if not */
    matchRegex: (text: string, pattern: RegExp): string | null => {
        return pattern.test(text) ? text : null;
    },
};
