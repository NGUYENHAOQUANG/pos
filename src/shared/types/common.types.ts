/**
 * @file common.types.ts
 * @description Common types
 * @author Kindy
 * @created 2025-11-16
 */

export interface PaginationParams {
    page: number;
    limit: number;
}

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

export enum StorageType {
    Unspecified = 'Unspecified',
    Local = 'Local',
    External = 'External',
    S3 = 'S3',
    Azure = 'Azure',
}

export interface IDocumentV2 {
    id: string;
    no: number;
    fileName: string;
    filePath: string;
    thumbnailPath: string | null;
    parentId: string | null;
    parentType: string | null;
    storageType: StorageType | string;
    contentType: string;
    size: number;
    publicUrl: string;
    concurrencyStamp: string;
    domainEvents: unknown[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: string | null;
}

export interface IDocumentV2Response {
    documents: IDocumentV2[];
    id: string;
    no: number;
    creatorId: string | null;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: string | null;
    editor: string | null;
}

/** Creator/Editor info from API  */
export interface ICreatorEditor {
    id: string;
    fullname: string;
    email?: string | null;
    phoneNumber?: string | null;
    avatar?: string | null;
    editedAt: string;
}

export interface PondLogMaterialType {
    warehouseItemId: string;
    quantity: number;
    name?: string | null;
    materialName?: string | null; // Dùng cho nhật kí công việc
    unitName?: string | null;
}
