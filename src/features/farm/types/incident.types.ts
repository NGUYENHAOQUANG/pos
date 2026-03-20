import type {
    IApiResponse,
    IPaginate,
    PaginationParams,
    ICreatorEditor,
} from '@/shared/types/common.types';

/** Material line in incident detail (API) */
export interface IncidentDetailMaterial {
    warehouseItemId: string;
    quantity: number;
}

/** Incident detail body (API) */
export interface IncidentDetail {
    materials: IncidentDetailMaterial[];
    notes: string;
}

/** Payload when creating an incident record (API) – POST /pond/{pondId}/incident */
export interface CreateIncidentPayload {
    documentIds?: string[];
    incidentDetail: IncidentDetail;
}

/** Payload when updating an incident record (API) */
export interface UpdateIncidentPayload {
    documentIds?: string[];
    incidentDetail?: IncidentDetail;
}

/** Single item in create/list response */
export interface IncidentCreateResult {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    recordId: string;
}

/** Query params for GET /pond/{pondId}/incident – dùng PaginationParams (page, limit) từ common.types */
export interface GetIncidentListParams extends PaginationParams {
    PondId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OrderBy?: string;
}

/** Single item in GET list response (matches API response) */
export interface IncidentListItem {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    pondId: string;
    operationId?: string;
    value?: number;
    detail?: {
        notes?: string;
        materials?: IncidentDetailMaterial[];
    };
    documentIds?: string[];
}

/** Response types – chuẩn common.types (IApiResponse, IPaginate) */
export type IncidentListResponse = IApiResponse<IPaginate<IncidentListItem>>;
export type IncidentDetailResponse = IApiResponse<IncidentListItem>;
export type IncidentCreateResponse = IApiResponse<IPaginate<IncidentCreateResult>>;
