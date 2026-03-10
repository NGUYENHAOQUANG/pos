import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface HarvestRecord {
    recordId: string;
    pondCode: string;
    pondName?: string;
    cycleCode: string | null;
    cycleName?: string;
    harvestDate: string;
    harvestType: string | null;
    doc: number;
    shrimpCountPerKg: number;
    totalWeightKg: number;
    unitPrice: number;
    revenue: number;
}

export interface HarvestStatsTableParams {
    ZoneId: string;
    CycleId?: string;
    StartDate?: string;
    EndDate?: string;
    PageNumber?: number;
    PageSize?: number;
    Id?: string;
    OrderBy?: string;
}

export type HarvestStatsTableResponse = IApiResponse<IPaginate<HarvestRecord>>;
