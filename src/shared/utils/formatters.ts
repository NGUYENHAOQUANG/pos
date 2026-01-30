/**
 * @file formatters.ts
 * @description Formatter utilities
 * @author Kindy
 * @created 2025-11-16
 */

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: format,
    }).format(dateObj);
}

export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

export function formatCurrencyValue(value: number): string {
    return value.toLocaleString('en-US');
}

export function formatNumericInput(text: string): string {
    return text.replace(/[^0-9]/g, '');
}

export function formatDecimalInput(text: string): string {
    // 1. Remove any character that is not 0-9 or .
    let cleaned = text.replace(/[^0-9.]/g, '');

    // 2. Prevent . at the beginning
    if (cleaned.startsWith('.')) {
        cleaned = cleaned.substring(1);
    }

    // 3. Ensure only one . exists
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    return cleaned;
}
