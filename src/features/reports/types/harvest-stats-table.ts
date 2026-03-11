import { IApiResponse, IPaginate } from '@/shared/types/common.types';
import { PondData } from '@/features/farm/types/pond.types';
import { CycleData } from '@/features/farm/types/cycle.types';

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

// ----------------------------------------------------------------------
// UI TYPES
// ----------------------------------------------------------------------

/** Props for HarvestStat main component */
export interface HarvestStatProps {
    zoneId: string;
    pondId?: string;
    cycleId?: string;
    ponds?: PondData[];
    cycles?: CycleData[];
}
