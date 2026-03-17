import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface HarvestRecord {
    recordId: string;
    pondName: string;
    cycleName: string | null;
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
    Page?: number;
    PageSize?: number;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OrderBy?: string;
}

export type HarvestStatsTableResponse = IApiResponse<IPaginate<HarvestRecord>>;

// ----------------------------------------------------------------------
// UI TYPES
// ----------------------------------------------------------------------

/** Props for HarvestStat main component */
export interface HarvestStatProps {
    zoneId: string;
    pondId?: string;
    cycleId?: string;
}
