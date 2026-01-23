import { AxiosError } from 'axios';
import { getMessageFromStatus } from '@/core/api/errorMapping';

// === Base Error Type ===
interface BaseError {
    message: string;
    data?: any;
    statusCode?: number;
}

// === Specific Error Types ===
export type ValidationError = BaseError & {
    type: 'VALIDATION_ERROR';
    fields: Record<string, string[]>;
};

export type UnauthorizedError = BaseError & {
    type: 'UNAUTHORIZED_ERROR';
};

export type ForbiddenError = BaseError & {
    type: 'FORBIDDEN_ERROR';
};

export type NotFoundError = BaseError & {
    type: 'NOT_FOUND_ERROR';
};

export type TimeoutError = BaseError & {
    type: 'TIMEOUT_ERROR';
};

export type TooManyRequestsError = BaseError & {
    type: 'TOO_MANY_REQUESTS_ERROR';
};

export type ServerError = BaseError & {
    type: 'SERVER_ERROR';
};

export type NetworkError = BaseError & {
    type: 'NETWORK_ERROR';
};

export type CommonError = BaseError & {
    type: 'COMMON_ERROR';
    action?: string;
};

// === Union Type ===
export type NormalizedError =
    | ValidationError
    | UnauthorizedError
    | ForbiddenError
    | NotFoundError
    | TimeoutError
    | TooManyRequestsError
    | ServerError
    | NetworkError
    | CommonError;

export interface ApiErrorResponse {
    success?: boolean;
    data?: any;
    message?: string;
    errorCode?: string | number;
    validationErrors?: Record<string, string[]>;
    details?: string;
    timestamp?: string;
}

export const normalizeApiError = (error: unknown): NormalizedError => {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // 1. Handle API response errors
    if (axiosError.response) {
        const { status, data } = axiosError.response;
        const message =
            data?.message ||
            getMessageFromStatus(status, axiosError.message || 'Đã có lỗi xảy ra.');

        // 400 Validation Error
        if (status === 400 && data?.validationErrors) {
            return {
                type: 'VALIDATION_ERROR',
                fields: data.validationErrors,
                message: data.message || 'Lỗi xác thực dữ liệu.',
                data,
                statusCode: status,
            };
        }

        // Specific HTTP Status Errors
        switch (status) {
            case 401:
                return {
                    type: 'UNAUTHORIZED_ERROR',
                    message,
                    data,
                    statusCode: status,
                };
            case 403:
                return {
                    type: 'FORBIDDEN_ERROR',
                    message,
                    data,
                    statusCode: status,
                };
            case 404:
                return {
                    type: 'NOT_FOUND_ERROR',
                    message,
                    data,
                    statusCode: status,
                };
            case 408:
                return {
                    type: 'TIMEOUT_ERROR',
                    message,
                    data,
                    statusCode: status,
                };
            case 429:
                return {
                    type: 'TOO_MANY_REQUESTS_ERROR',
                    message,
                    data,
                    statusCode: status,
                };
        }

        // Server Errors (500-599)
        if (status >= 500 && status < 600) {
            return {
                type: 'SERVER_ERROR',
                message,
                data,
                statusCode: status,
            };
        }

        // Default Common Error
        return {
            type: 'COMMON_ERROR',
            message,
            data,
            statusCode: status,
        };
    }

    // 2. Handle Network/Request errors
    if (axiosError.request) {
        if (axiosError.code === 'ECONNABORTED') {
            return {
                type: 'TIMEOUT_ERROR',
                message: 'Quá thời gian chờ kết nối. Vui lòng thử lại.',
            };
        }

        return {
            type: 'NETWORK_ERROR',
            message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.',
        };
    }

    // 3. Fallback
    return {
        type: 'COMMON_ERROR',
        message: axiosError.message || 'Đã có lỗi không xác định xảy ra.',
    };
};
