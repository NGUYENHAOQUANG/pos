import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

// Enum for stock transfer status - matches backend StatusRecordEnum
export enum StockTransferStatus {
    Success = 'Success',
    Error = 'Error',
    Pending = 'Pending',
    Cancel = 'Cancel',
}

export interface IStockTransferToPond {
    toPondId: string;
    quantity: number;
}

export interface IStockTransfer {
    id: string;
    no: number;
    creatorId?: string;
    editorId?: string;
    createdAt: string;
    editedAt?: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
    fromPondId: string;
    fromCycleId?: string;
    toPonds: IStockTransferToPond[];
    totalStocking: number;
    shrimpSizePcsPerKg: number;
    notes?: string;
    status: StockTransferStatus;
}

export interface IStockTransferDetail extends IStockTransfer {
    // Detail API returns full pond and cycle objects
    pond?: Record<string, unknown>;
    cycle?: Record<string, unknown>;
}

export interface CreateStockTransferRequest {
    toPonds: {
        toPondId: string;
        quantity: number;
    }[];
    totalStocking: number;
    shrimpSizePcsPerKg: number;
    notes?: string;
}

export interface GetStockTransfersParams {
    PondId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetStockTransfersResponse = IApiResponse<IPaginate<IStockTransfer>>;
export type GetStockTransferDetailResponse = IApiResponse<IStockTransferDetail>;
export type CreateStockTransferResponse = IApiResponse<{ id: string }>;
