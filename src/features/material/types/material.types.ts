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

export interface MaterialResponse {
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
    unitId: number;
    unitName?: string | null;
    materialGroupId?: number;
    materialTypeId?: number;
    description?: string | null;
    isActive?: boolean;
}

export interface GetMaterialsParams {
    SearchText?: string;
    MaterialTypeId?: string;
    Page?: number;
    PageSize?: number;
}

export type GetMaterialsResponse = IAppResponse<IPaginate<MaterialResponse>>;
export type GetMaterialByIdResponse = IAppResponse<MaterialResponse>;
