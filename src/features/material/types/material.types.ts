export type MaterialGroupType =
    | 'Nuôi'
    | 'Vật tư nội bộ'
    | 'CCDC'
    | 'Thiết bị điện'
    | 'Chi phí khác'
    | string;

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

export interface IPaginate<T> {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: T[] | null;
}

export interface IAppResponse<T> {
    result: boolean;
    statusCode: number;
    message?: string | null;
    exception?: string | null;
    traceId?: string | null;
    data: T;
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
    Search?: string;
    MaterialTypeId?: number;
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
    Page?: number;
    PageSize?: number;
}
