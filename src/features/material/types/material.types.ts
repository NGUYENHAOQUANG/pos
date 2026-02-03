import { IApiResponse as IAppResponse, IPaginate } from '@/shared/types/common.types';

export enum MaterialGroupType {
    FARMING = 'Nuôi',
    INTERNAL = 'Vật tư nội bộ',
    CCDC = 'CCDC',
    ELECTRIC = 'Thiết bị điện',
    OTHER = 'Chi phí khác',
    FEED = 'Thức ăn',
    TOOLS = 'Công cụ',
    DRAFT = 'Bản nháp',
    PENDING = 'Chờ duyệt',
    COMPLETED = 'Hoàn thành',
    REJECTED = 'Từ chối',
}

export interface IMaterial {
    id: string;
    name: string;
    group: MaterialGroupType;
    groupId?: string;
    type?: string;
    typeId?: string;
    unit: string;
    unitName?: string;
    usage?: string;
    unitOfUse?: string;
    dosage?: string;
    manufacturer?: string;
    remaining?: number;
    price?: number;
    quantity?: string | number;
    isActive?: boolean;
}

export interface IUnit {
    id: string;
    name: string;
}

export type GetUnitsResponse = IAppResponse<IPaginate<IUnit>>;

export interface IMaterialGroup {
    id: number;
    creatorId?: number | null;
    createdAt?: string | null;
    lastModifierId?: number | null;
    lastModifiedAt?: string | null;
    name: string | null;
    code: string | null;
    description?: string | null;
}

export type GetMaterialGroupsResponse = IAppResponse<IPaginate<IMaterialGroup>>;
export type GetMaterialGroupByIdResponse = IAppResponse<IMaterialGroup>;

export interface IMaterialType {
    id: string;
    creatorId?: number | null;
    createdAt?: string | null;
    lastModifierId?: number | null;
    lastModifiedAt?: string | null;
    name: string | null;
    code?: string | null;
    materialGroupId: number;
}

export type GetMaterialTypesResponse = IAppResponse<IPaginate<IMaterialType>>;
export type GetMaterialTypeByIdResponse = IAppResponse<IMaterialType>;

// ============ Material API Types ============
export interface MaterialResponseV2 {
    id: string;
    code: string;
    name: string;
    materialTypeId: string;
    materialGroupId: string;
    materialTypeName?: string;
    unitId: string;
    unitName?: string;
    description?: string;
    manufacturer?: string;
    isActive: boolean;
    no: number;
    creatorId?: string | null;
    userCreatorId?: string | null;
    editorId?: string | null;
    userEditorId?: string | null;
    createdAt: string;
    editedAt?: string;
    creator?: any;
    editor?: any;
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

export interface GetMaterialsParams {
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

export interface UpdateMaterialResponseData {
    materialId: string;
    name: string;
}

export type GetMaterialsV2Response = IAppResponse<IPaginate<MaterialResponseV2>>;
export type GetMaterialByIdV2Response = IAppResponse<MaterialResponseV2>;
export type CreateMaterialResponse = IAppResponse<MaterialResponseV2>;
export type UpdateMaterialResponse = IAppResponse<UpdateMaterialResponseData>;
export type DeleteMaterialResponse = IAppResponse<string>;
