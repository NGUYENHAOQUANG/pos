import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';
import { PondData } from '@/features/farm/types/pond.types';

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

// ─── Detail-specific nested types ───────────────────────────────────────────

export interface IZoneInfo {
    id: string;
    name: string;
    code?: string;
    farmId?: string;
}

export interface IPondCategoryInfo {
    id: string;
    name: string;
    code?: string;
}

export interface IPondInfo extends Omit<PondData, 'zone'> {
    zone?: IZoneInfo | null;
    pondCategory?: IPondCategoryInfo | null;
    lastOperationAt?: string | null;
    isDeleted?: boolean;
    updatedAt?: string;
}

export interface ICycleInfo {
    id: string;
    no: number;
    code: string;
    name: string;
    pondId: string;
    seasonId?: string;
    parentCycleId?: string | null;
    status: string;
    endDate?: string | null;
    notes?: string;
    pond?: IPondInfo | null;
    season?: ISeasonInfo | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

export interface ISeasonInfo {
    id: string;
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface IStockTransferToPondDetail extends IStockTransferToPond {
    pond?: IPondInfo | null;
}

export interface IStockTransferDetail extends Omit<IStockTransfer, 'toPonds'> {
    toPonds: IStockTransferToPondDetail[];
    pond?: IPondInfo | null;
    cycle?: ICycleInfo | null;
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
