import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

export interface IInventoryCheck {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creatorId: string;
    editorId: string;
    creator: ICreatorEditor | null;
    editor: ICreatorEditor | null;
    checkCode: string;
    warehouseId: string;
    warehouseName: string;
    status: string;
    totalItems: number;
    varianceTotalItems?: number;
    note: string;
    approverId?: string;
    approvedAt?: string;
    isRejected: boolean;
    approver?: ICreatorEditor | null;
    items?: IInventoryCheckItem[];
}

export interface GetInventoryChecksParams {
    Search?: string;
    CheckCode?: string;
    Status?: string;
    WarehouseId?: string;
    ApprovedAtFrom?: string;
    ApprovedAtTo?: string;
    CreatorName?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
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

export interface GetInventoryCheckItemsParams {
    InventoryCheckId?: string;
    MaterialName?: string;
    MaterialCode?: string;
    MinExpectedQty?: number;
    MaxExpectedQty?: number;
    HasDifference?: boolean;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface InventoryCheckItem {
    inventoryCheckId: string;
    materialId: string;
    materialName: string;
    materialCode: string;
    unitId: string;
    unitName: string;
    expectedQty: number;
    actualQty: number;
    difference: number;
    id: string;
    no?: number;
    creatorId?: string | null;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string | null;
    creator?: any;
    editor?: any;
}

export type GetInventoryCheckItemsResponse = IApiResponse<IPaginate<InventoryCheckItem>>;

export interface CreateInventoryCheckItemRequest {
    materialId: string;
    actualQty: number;
    expectedQty?: number;
}

export interface CreateInventoryCheckRequest {
    warehouseId: string;
    note?: string;
    items?: CreateInventoryCheckItemRequest[] | null;
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
    items: UpdateInventoryCheckItemDto[];
}
