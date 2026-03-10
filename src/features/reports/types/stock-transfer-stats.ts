import { IApiResponse, IPaginate } from '@/shared/types/common.types';

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
