import { IApiResponse as IAppResponse, IPaginate } from '@/shared/types/common.types';

export enum SpecificType {
    Normal = 'Normal',
    ShrimpSeed = 'ShrimpSeed',
    ShrimpFeed = 'ShrimpFeed',
}

export interface GetWarehouseItemsQueryParams {
    WarehouseId?: string;
    SearchText?: string;
    MaterialGroupIds?: string[];
    MaterialTypeIds?: string[];
    SpecificType?: SpecificType;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface IWarehouse {
    id: string;
    name: string;
    code: string;
    zoneId?: string;
    zoneName?: string;
    description?: string;
    address?: string;
}

export interface GetWarehousesParams {
    ZoneId?: string;
    Search?: string;
    MaterialTypeId?: string;
    Page?: number;
    PageSize?: number;
}

export interface IWarehouseItem {
    id: string;
    materialId: string;
    materialName?: string;
    materialGroupId?: string;
    materialTypeId?: string;
    materialCode?: string;
    quantity: number;
    unitName?: string;
    manufacturer?: string;
    averagePrice?: number;
    alertQty?: number;
    no?: number;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
}

export type GetWarehouseItemsResponse = IAppResponse<IPaginate<IWarehouseItem>>;

export interface IShrimpSeed {
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    averagePrice: number;
    alertQty: number;
    id: string;
    no: number;
    supplier?: string;
    manufacturer?: string;
}

export type GetShrimpSeedsResponse = IAppResponse<IPaginate<IShrimpSeed>>;
