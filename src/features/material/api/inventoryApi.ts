import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IAppResponseV2, IPaginateV2 } from '@/features/material/types/materialGroup.types';

export interface IInventoryCheck {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator: {
        id: number;
        fullName?: string;
        userName?: string;
    } | null;
    editor: {
        id: number;
        fullName?: string;
        userName?: string;
    } | null;
    checkCode: string;
    warehouseId: string;
    warehouseName: string;
    status: string;
    totalItems: number;
    note: string;
    approverId?: string;
    approvedAt?: string;
    isRejected: boolean;
}

export interface GetInventoryChecksParams {
    Page?: number;
    PageSize?: number;
    WarehouseId?: string;
    Status?: string;
    CheckCode?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OrderBy?: string;
}

export type GetInventoryChecksResponse = IAppResponseV2<IPaginateV2<IInventoryCheck>>;

export interface IInventoryCheckItem {
    inventoryCheckItemId: string;
    materialId: string;
    materialName: string | null;
    materialCode: string | null;
    expectedQty: number;
    actualQty: number;
    difference: number;
}

export interface IInventoryCheckDetail extends IInventoryCheck {
    items: IInventoryCheckItem[];
}

export type GetInventoryCheckDetailResponse = IAppResponseV2<IInventoryCheckDetail>;

export const inventoryApi = {
    getList: async (params?: GetInventoryChecksParams): Promise<GetInventoryChecksResponse> => {
        const { data } = await apiClient.get<GetInventoryChecksResponse>(
            API_ENDPOINTS.INVENTORY_CHECK.LIST,
            { params }
        );
        return data;
    },
    getDetail: async (id: string): Promise<GetInventoryCheckDetailResponse> => {
        const { data } = await apiClient.get<GetInventoryCheckDetailResponse>(
            `${API_ENDPOINTS.INVENTORY_CHECK.LIST}/${id}`
        );
        return data;
    },
};
