/**
 * @file materialGroup.types.ts
 * @description Material Group types for new API structure
 * @author Kindy
 * @created 2026-01-23
 */

// ============ Material Group Types (New API) ============
export interface IMaterialGroupV2 {
    id: string; // UUID format
    name: string;
    code: string;
    description: string;
    no: number; // Order number
    createdAt: string;
    editedAt: string;
    creator: string | null;
    editor: string | null;
}

export interface CreateMaterialGroupV2Request {
    name: string;
    code: string;
    description?: string;
}

export interface UpdateMaterialGroupV2Request {
    name?: string;
    code?: string;
    description?: string;
}

// ============ Pagination Types (New API) ============
export interface IPaginateV2<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// ============ Response Types (New API) ============
export interface IAppResponseV2<T> {
    success: boolean;
    data: T;
    message?: string | null;
    errorCode?: string | null;
    validationErrors?: any;
    details?: string | null;
    timestamp?: string;
}

export type GetMaterialGroupsV2Response = IAppResponseV2<IPaginateV2<IMaterialGroupV2>>;
export type GetMaterialGroupByIdV2Response = IAppResponseV2<IMaterialGroupV2>;

// ============ Query Params ============
export interface GetMaterialGroupsV2Params {
    SearchText?: string;
    Code?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface GetMaterialTypesV2Params {
    SearchText?: string;
    MaterialTypeId?: string;
    IsActive?: boolean;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

// ============ Material API Types ============
export interface MaterialResponseV2 {
    id: number;
    creatorId?: number | null;
    createdAt?: string | null;
    lastModifierId?: number | null;
    lastModifiedAt?: string | null;
    isDeleted?: boolean;
    deleterId?: number | null;
    deletedAt?: string | null;
    code?: string | null;
    name?: string | null;
    manufacturer?: string | null;
    unitId: string;
    unitName?: string | null;
    materialGroupId?: string;
    materialTypeId?: string;
    description?: string | null;
    isActive?: boolean;
}

export interface CreateMaterialV2Request {
    name: string;
    materialTypeId: string;
    description: string;
    unitId: string;
    manufacturer?: string | null;
    isActive?: boolean;
}

export interface UpdateMaterialV2Request {
    name?: string | null;
    materialTypeId?: string | null;
    description?: string | null;
    unitId?: string | null;
    manufacturer?: string | null;
    isActive?: boolean | null;
}

export interface GetMaterialsV2Params {
    SearchText?: string;
    materialTypeId?: string;
    Page?: number;
    PageSize?: number;
}

export type GetMaterialsV2Response = IAppResponseV2<IPaginateV2<MaterialResponseV2>>;
export type GetMaterialByIdV2Response = IAppResponseV2<MaterialResponseV2>;
