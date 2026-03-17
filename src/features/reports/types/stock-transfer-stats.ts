import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface StockTransferRecordDto {
    recordId: string;
    fromPondName: string | null;
    toPondName: string | null;
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
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
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
}
