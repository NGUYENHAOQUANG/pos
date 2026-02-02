import { IApiResponse, IPaginate } from '@/shared/types/common.types';
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

export type GetMaterialGroupsV2Response = IApiResponse<IPaginate<IMaterialGroupV2>>;
export type GetMaterialGroupByIdV2Response = IApiResponse<IMaterialGroupV2>;

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

// ============ Material API Types ============
export interface MaterialResponseV2 {
    id: string;
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
    MaterialTypeId?: string;
    Page?: number;
    PageSize?: number;
    warehouseId?: string;
}

export interface UpdateMaterialResponseData {
    materialId: string;
    name: string;
}

export type GetMaterialsV2Response = IApiResponse<IPaginate<MaterialResponseV2>>;
export type GetMaterialByIdV2Response = IApiResponse<MaterialResponseV2>;
export type CreateMaterialResponse = IApiResponse<MaterialResponseV2>;
export type UpdateMaterialResponse = IApiResponse<UpdateMaterialResponseData>;
export type DeleteMaterialResponse = IApiResponse<string>;
