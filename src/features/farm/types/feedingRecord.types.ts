import type {
    IApiResponse,
    IPaginate,
    ICreatorEditor,
    PondLogMaterialType,
} from '@/shared/types/common.types';

/** Body detail for feeding record (API) */
export interface FeedingDetailPayload {
    notes: string;
    materials: PondLogMaterialType[];
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
        materials?: PondLogMaterialType[];
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
