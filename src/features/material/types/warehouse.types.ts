import { IApiResponse as IAppResponse, IPaginate } from '@/shared/types/common.types';

export interface GetWarehouseItemsQueryParams {
    id?: string;
    Search?: string;
    MaterialGroupId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface IExportWarehouseMaterialItem {
    id: string;
    materialName: string;
    quantity: string;
    price: string;
    unit?: string;
    total?: number;
}

export interface IExportWarehouseReceipt {
    id: string;
    date: Date | string;
    farm?: string;
    materials: IExportWarehouseMaterialItem[];
    totalAmount: number;
    totalItems?: number;
    status?: string;
}

export interface GetWarehouseParams {
    Search?: string;
    MaterialName?: string;
    Page?: number;
    PageSize?: number;
    ZoneId?: string;
    Name?: string;
    Location?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OrderBy?: string;
}

export interface IWarehouse {
    id: string;
    name: string;
    code: string;
    zoneId?: string;
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
    quantity: number;
    unitId: string;
    unitName?: string;
    alertQty?: number;
    materialCode?: string;
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
