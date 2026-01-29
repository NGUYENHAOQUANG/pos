import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface IInventoryCheck {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator: {
        id: string;
        fullname: string;
        email: string;
        phoneNumber?: string;
        avatar?: string;
    } | null;
    editor: {
        id: string;
        fullname: string;
        email: string;
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

export type GetInventoryChecksResponse = IApiResponse<IPaginate<IInventoryCheck>>;

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

export type GetInventoryCheckDetailResponse = IApiResponse<IInventoryCheckDetail>;

export interface CreateInventoryCheckRequest {
    warehouseId: string;
    note?: string;
    items?:
        | {
              materialId: string;
              actualQty: number;
              expectedQty?: number;
          }[]
        | null;
    autoSubmit?: boolean;
}

export interface InventoryCheckItemDto {
    materialId: string;
    expectedQty: number;
    actualQty: number;
    reason?: string;
}

export interface AddInventoryCheckItemsRequest {
    inventoryCheckId: string;
    items: InventoryCheckItemDto[];
}

export interface UpdateInventoryCheckItemDto {
    inventoryCheckItemId: string;
    actualQty: number;
}

export interface UpdateInventoryCheckItemsRequest {
    // inventoryCheckId: string; // Removed from body as it's a path parameter
    items: UpdateInventoryCheckItemDto[];
}
