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
    /** Keep only digits — strips decimals, whitespace, and invisible chars on paste */
    integer: (text: string): string => {
        // First trim whitespace (common when pasting), then strip everything except 0-9
        return text.trim().replace(/[^0-9]/g, '');
    },

    /** Keep digits and at most one decimal point (dot cannot be first), optionally limit integer and decimal places */
    decimal: (
        text: string,
        maxDecimalPlaces: number = 5,
        maxIntegerPlaces: number = 15
    ): string => {
        const textWithDot = text.replace(/,/g, '.');
        const cleaned = textWithDot.replace(/[^0-9.]/g, '');
        // Remove leading dots
        const noLeadingDot = cleaned.replace(/^\.+/, '');
        const parts = noLeadingDot.split('.');
        let result: string;
        if (parts.length <= 2) {
            result = noLeadingDot;
        } else {
            // Keep only first decimal point
            result = parts[0] + '.' + parts.slice(1).join('');
        }

        const finalParts = result.split('.');
        let intPart = finalParts[0];

        // Limit integer places
        if (intPart.length > maxIntegerPlaces) {
            intPart = intPart.slice(0, maxIntegerPlaces);
        }

        // Limit decimal places if specified
        if (finalParts.length > 1) {
            const decPart = finalParts[1].slice(0, maxDecimalPlaces);
            return intPart + '.' + decPart;
        }

        return intPart;
    },

    /** Test text against a regex pattern — returns text if valid, null if not */
    matchRegex: (text: string, pattern: RegExp): string | null => {
        return pattern.test(text) ? text : null;
    },
};
