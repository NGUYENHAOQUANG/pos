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

export interface HarvestStatsResponse {
    success: boolean;
    data: HarvestStatsData;
    message: string | null;
}
