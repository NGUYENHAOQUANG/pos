import { IApiResponse } from '@/shared/types/common.types';

export interface HarvestStatsKPIs {
    totalHarvested: number;
    averageHarvestedPerPond: number;
    maxHarvestedInOnePond: number;
    minHarvestedInOnePond: number;
    harvestedPondCount: number;
    totalHarvestCount: number;
    totalRemainingStock: number;
}

export interface HarvestStatsByPond {
    pondId: string;
    pondName: string;
    pondCode: string;
    zoneName: string;
    harvestCount: number;
    totalHarvested: number;
    averageHarvestedPerTime: number;
    minHarvestedInOneTime: number;
    maxHarvestedInOneTime: number;
    percentageOfTotalHarvest: number;
    remainingStock: number;
}

export interface HarvestStatsByDOC {
    docDay: number;
    harvestedPondCount: number;
    totalHarvested: number;
    remainingStock: number;
}

export interface HarvestStatsData {
    kpis: HarvestStatsKPIs;
    byPond: HarvestStatsByPond[];
    byDOC: HarvestStatsByDOC[];
}

export interface HarvestStatsParams {
    ZoneId: string;
    Id?: string;
    PondIds?: string[];
    PondCategoryIds?: string[];
    SeasonId?: string;
}

export type HarvestStatsResponse = IApiResponse<HarvestStatsData>;

// ===== Component Props =====
export interface HarvestChartProps {
    zoneId: string;
    pondId?: string;
    seasonId?: string;
}
export interface HarvestChartData {
    pond: string;
    yield: number;
}
