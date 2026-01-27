/**
 * @file common.types.ts
 * @description Common types
 * @author Kindy
 * @created 2025-11-16
 */

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

// ============ New Standard Types (V2/Common) ============

export interface IPaginate<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string | null;
    errorCode?: string | null;
    validationErrors?: any;
    details?: string | null;
    timestamp?: string;
}
