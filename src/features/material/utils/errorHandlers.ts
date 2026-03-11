/**
 * @file errorHandlers.ts
 * @description Error handling utilities for Material API
 * @created 2025-01-XX
 */
import { normalizeApiError } from '@/core/api/errorHandler';

/**
 * Extract error message from API error response
 * Uses the core normalizeApiError function for consistent error handling
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    const normalizedError = normalizeApiError(error);

    // If normalizedError has a specific message, use it
    if (normalizedError.message) {
        let message = normalizedError.message;

        // Centralized mapping for material/stock errors
        if (
            message.includes('invalid start of a value') ||
            message.includes('converted to System.Decimal') ||
            message.includes('System.Decimal') ||
            message.includes('Insufficient central warehouse stock')
        ) {
            return 'Số lượng vật tư không hợp lệ !';
        }

        // For validation errors, we might want to be more specific if needed
        if (normalizedError.type === 'VALIDATION_ERROR' && normalizedError.fields) {
            const firstField = Object.keys(normalizedError.fields)[0];
            if (firstField && normalizedError.fields[firstField]?.length > 0) {
                return normalizedError.fields[firstField][0];
            }
        }
        return message;
    }

    return defaultMessage;
};
