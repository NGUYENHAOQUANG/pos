import type { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

/** Material line in feeding detail (API) */
export interface FeedingMaterial {
    warehouseItemId: string;
    quantity: number;
}

/** Body detail for feeding record (API) */
export interface FeedingDetailPayload {
    notes: string;
    materials: FeedingMaterial[];
}

/** Payload when creating a feeding record – POST /pond/{pondId}/feeding-records */
export interface CreateFeedingRecordPayload {
    feedingDetail: FeedingDetailPayload;
}

/** Single item in create response */
export interface FeedingRecordCreateResult {
    id: string;
    no: number;
    creatorId: string;
    editorId: string;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    recordId: string;
    exportReceiptId: string;
}

/** List item / detail item for feeding record (GET /feeding-records) */
export interface FeedingRecordItem {
    id: string;
    no: number;
    createdAt: string;
    editedAt?: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    pondId: string;
    feedingDetail?: {
        notes?: string;
        materials?: FeedingMaterial[];
    };
    documentIds?: string[];
}

export interface FeedingRecordListParams {
    PondId?: string;
    CycleId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

/** Response types */
export type FeedingRecordListResponse = IApiResponse<IPaginate<FeedingRecordItem>>;
export type FeedingRecordDetailResponse = IApiResponse<FeedingRecordItem>;
export type FeedingRecordCreateResponse = IApiResponse<FeedingRecordCreateResult>;
