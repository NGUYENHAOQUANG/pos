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
