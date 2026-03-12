import { IApiResponse, IPaginate } from '@/shared/types/common.types';
import { PondData } from '@/features/farm/types/pond.types';

export interface StockTransferRecordDto {
    recordId: string;
    fromPondCode: string | null;
    toPondCode: string | null;
    releaseDate: string;
    transferDate: string;
    doc: number;
    releaseQuantity: number;
    shrimpCountPerKg: number;
    estimatedShrimpCount: number;
    transferQuantity: number;
}

export interface StockTransferStatsParams {
    ZoneId: string;
    CycleId?: string;
    StartDate?: string;
    EndDate?: string;
    PageNumber?: number;
    PageSize?: number;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    OrderBy?: string;
}

export type StockTransferStatsResponse = IApiResponse<IPaginate<StockTransferRecordDto>>;

// ----------------------------------------------------------------------
// UI TYPES (used by component + hook)
// ----------------------------------------------------------------------

/** UI-ready transfer data for TransferItemCard */
export interface TransferData {
    id: string;
    sourcePond: string;
    targetPond: string;
    transferDate: string;
    doc: number;
    amount: string;
    size: string;
    stockingDate: string;
    stockingAmount: string;
    expectedAmount: string;
}

/** Props for PondTransfer main component */
export interface PondTransferProps {
    zoneId: string;
    pondId?: string;
    cycleId?: string;
    ponds?: PondData[];
}
