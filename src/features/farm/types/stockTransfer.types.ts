import { IApiResponse, IPaginate } from '@/shared/types/common.types';
import { IStatus } from '@/features/farm/types/farm.types';

export interface IStockTransferToPond {
    toPondId: string;
    quantity: number;
    // Optional fields for display if needed, based on UI requirements
    toPondName?: string;
}

export interface IStockTransfer {
    id: string;
    no: number;
    createdAt: string;
    createdBy?: string;
    fromPondId: string;
    fromPondName?: string; // If available in DTO
    toPonds: IStockTransferToPond[];
    totalStocking: number;
    shrimpSizePcsPerKg: number;
    notes?: string;
    status: IStatus;
}

export interface IStockTransferDetail extends IStockTransfer {
    // Add additional fields returned by Detail API if any
    fromCycleId?: string;
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
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
    FromDate?: string;
    ToDate?: string;
}

export type GetStockTransfersResponse = IApiResponse<IPaginate<IStockTransfer>>;
export type GetStockTransferDetailResponse = IApiResponse<IStockTransferDetail>;
export type CreateStockTransferResponse = IApiResponse<{ id: string }>;
