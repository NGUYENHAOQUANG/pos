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
    validationErrors?: Record<string, string[]> | null;
    details?: string | null;
    timestamp: string;
}

export interface IDocument {
    id: string;
    fileName?: string;
    filePath?: string;
    publicUrl?: string;
}

/** Creator/Editor info from API  */
export interface ICreatorEditor {
    id: string;
    fullname: string;
    email?: string | null;
    phoneNumber?: string | null;
    avatar?: string | null;
    createdAt: string;
    editedAt: string;
}
