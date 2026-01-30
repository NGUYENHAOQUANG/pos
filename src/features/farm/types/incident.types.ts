import type { IApiResponse, IPaginate } from '@/shared/types/common.types';

/** Document item in API response (for resolving image URLs) */
export interface IncidentDocument {
    id: string;
    fileName?: string;
    filePath?: string;
    publicUrl?: string;
}

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

/** Creator/Editor in API response */
export interface IncidentCreator {
    id: string;
    fullname: string;
    email?: string;
    phoneNumber?: string;
    avatar?: string;
    createdAt: string;
    editedAt: string;
}

/** Single item in create/list response */
export interface IncidentCreateResult {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator?: IncidentCreator;
    editor?: IncidentCreator;
    recordId: string;
}

export interface IncidentDto {
    id: string;
    createdAt?: string;
    editedAt?: string;
    pondId: string;
    documentIds?: string[];
    documents?: IncidentDocument[];
}

/** Query params for GET /pond/{pondId}/incident */
export interface GetIncidentListParams {
    PondId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

/** Single item in GET list response (matches API response) */
export interface IncidentListItem {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator?: IncidentCreator;
    editor?: IncidentCreator;
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
