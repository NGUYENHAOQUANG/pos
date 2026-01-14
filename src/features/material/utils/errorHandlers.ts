/**
 * @file errorHandlers.ts
 * @description Error handling utilities for Material API
 * @created 2025-01-XX
 */

/**
 * API Error Response structure
 */
interface ApiErrorResponse {
    data?: {
        errors?: Record<string, string[]>;
    };
    result: boolean;
    statusCode: number;
    message?: string | null;
    exception?: string | null;
}

/**
 * Extract error message from API error response
 * Priority: validation errors > message > default message
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    // Check if it's an Axios error with response
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        const errorData = axiosError.response?.data;

        if (errorData) {
            // Check for validation errors first
            if (errorData.data?.errors) {
                const errors = errorData.data.errors;
                // Get first error message from first field
                const firstField = Object.keys(errors)[0];
                if (firstField && errors[firstField] && errors[firstField].length > 0) {
                    return errors[firstField][0];
                }
            }

            // Fallback to message field
            if (errorData.message) {
                return errorData.message;
            }
        }
    }

    // Check if it's a regular Error
    if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
};
