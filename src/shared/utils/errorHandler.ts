/**
 * @file errorHandler.ts
 * @description Error handling utilities
 * @author Kindy
 * @created 2025-11-16
 */
import { NormalizedError } from '@/core/api/errorHandler';
import Toast from 'react-native-toast-message';

export class ApiError extends Error {
    constructor(public statusCode: number, public message: string, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

export const handleError = (err: unknown) => {
    const error = err as NormalizedError;

    if (error.type === 'VALIDATION_ERROR') {
        const firstFieldKey = Object.keys(error.fields)[0];
        if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
            Toast.show({
                type: 'error',
                text1: error.fields[firstFieldKey][0],
                visibilityTime: 4000,
            });
            return;
        }
    }

    if (error.type === 'NOT_FOUND_ERROR') {
        Toast.show({
            type: 'error',
            text1: error.message,
            visibilityTime: 4000,
        });
        return;
    }

    Toast.show({ type: 'error', text1: error.message || 'Có lỗi xảy ra' });
};
