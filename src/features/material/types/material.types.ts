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
    groupId?: string; // groupId for API calls
    type?: string;
    typeId?: string; // typeId for API calls
    unit: string; // unitId for API calls
    unitName?: string; // unitName for display
    usage?: string;
    unitOfUse?: string;
    dosage?: string;
    manufacturer?: string;
    remaining?: number;
    price?: number; // Sometimes used in warehouse context
    quantity?: string | number; // Sometimes used in warehouse context
    isActive?: boolean; // Material status (active/inactive)
}

export interface IUnit {
    id: string;
    name: string;
}

export type GetUnitsResponse = IAppResponse<IPaginate<IUnit>>;

export interface IWarehouseMaterialItem {
    id: string;
    materialName: string;
    quantity: string;
    price: string;
    unit?: string;
    // Helper for total calculation
    total?: number;
}

export interface IWarehouseReceipt {
    id: string;
    date: Date | string;
    supplier?: string;
    materials: IWarehouseMaterialItem[];
    totalAmount: number;
    documentIds?: string[];
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
    farm?: string; // Trường trại thay vì supplier
    materials: IExportWarehouseMaterialItem[];
    totalAmount: number;
    totalItems?: number;
    status?: string;
}

export interface IInventoryTicketItem {
    id: string;
    materialName: string;
    beforeQuantity: number;
    afterQuantity: number;
}

export interface IInventoryTicket {
    id: string;
    checkerName: string;
    date: string;
    note: string;
    totalDifference: number;
    items: IInventoryTicketItem[];
    status: string;
}

export interface IInventoryFormItem {
    name: string;
    oldStock: number;
    newStock: number;
    diff: number;
}

export interface IInventoryFormData {
    date: string;
    note: string;
    items: IInventoryFormItem[];
}

// ============ Material Group Types ============
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

export interface CreateMaterialGroupRequest {
    name: string;
    code: string;
    description?: string | null;
}

export interface UpdateMaterialGroupRequest {
    name?: string | null;
    code?: string | null;
    description?: string | null;
}

export type GetMaterialGroupsResponse = IAppResponse<IPaginate<IMaterialGroup>>;
export type GetMaterialGroupByIdResponse = IAppResponse<IMaterialGroup>;

// ============ Material Type Types ============
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

export interface CreateMaterialTypeRequest {
    name: string;
    code?: string | null;
    materialGroupId: number;
}

export interface UpdateMaterialTypeRequest {
    name?: string | null;
    code?: string | null;
    materialGroupId?: number | null;
}

export type GetMaterialTypesResponse = IAppResponse<IPaginate<IMaterialType>>;
export type GetMaterialTypeByIdResponse = IAppResponse<IMaterialType>;

// ============ Material API Types ============

// User info object returned in material response
export interface IMaterialUser {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    avatar: string;
    roleName: string;
    createdAt: string;
    editedAt: string;
}

export interface MaterialResponse {
    id: string; // UUID
    no: number; // Sequence number
    creatorId?: string | null;
    userCreatorId?: string | null; // User creator ID
    editorId?: string | null; // Editor ID
    userEditorId?: string | null; // User editor ID
    createdAt?: string | null;
    editedAt?: string | null; // Edit timestamp
    creator?: IMaterialUser | null; // Creator user info
    editor?: IMaterialUser | null; // Editor user info
    materialId?: string | null; // Material ID (returned after create)
    // Legacy fields for backward compatibility
    lastModifierId?: string | null;
    lastModifiedAt?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletedAt?: string | null;
    code?: string | null;
    name?: string | null;
    manufacturer?: string | null;
    unitId: string; // UUID
    unitName?: string | null;
    materialGroupId?: string; // UUID
    materialTypeId?: string; // UUID
    materialTypeName?: string | null; // Material type name for display
    description?: string | null; // Map to usage field
    isActive?: boolean; // Material status (active/inactive)
}

export interface CreateMaterialRequest {
    name: string;
    materialTypeId: number;
    description: string;
    unitId: number;
    manufacturer?: string | null;
    isActive?: boolean;
}

export interface UpdateMaterialRequest {
    name?: string | null;
    materialTypeId?: number | null;
    description?: string | null;
    unitId?: number | null;
    manufacturer?: string | null;
    isActive?: boolean | null;
}

export interface GetMaterialsParams {
    SearchText?: string;
    MaterialTypeId?: string;
    Page?: number;
    PageSize?: number;
}

export type GetMaterialsResponse = IAppResponse<IPaginate<MaterialResponse>>;
export type GetMaterialByIdResponse = IAppResponse<MaterialResponse>;

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

export interface GetExportWarehouseParams {
    Search?: string;
    MaterialName?: string;
    Page?: number;
    PageSize?: number;
}

export interface GetInventoryParams {
    Search?: string;
    Page?: number;
    PageSize?: number;
    WarehouseId?: string;
}
// ============ Warehouse Types (Real API) ============
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
    id: string; // The warehouse item ID (used for transactions)
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
    materialCode: string; // e.g., "VT26012617235547"
    quantity: number;
    averagePrice: number;
    alertQty: number;
    id: string; // warehouse item id
    no: number;
    supplier?: string;
    manufacturer?: string;
}

export type GetShrimpSeedsResponse = IAppResponse<IPaginate<IShrimpSeed>>;
