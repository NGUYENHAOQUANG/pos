import { IApiResponse } from '@/shared/types/common.types';

export interface ProfitStatsKPIs {
    totalActualRevenue: number;
    totalEstimatedRevenue: number;
    totalMaterialCost: number;
    totalEstimatedProfit: number;
}

export interface ProfitStatsByDate {
    date: string;
    actualRevenueOnDate: number;
    estimatedRevenueFromRemainingStockOnDate: number;
    materialCostOnDate: number;
    cumulativeEstimatedProfit: number;
    activePondCount: number;
}

export interface ProfitStatsData {
    kpis: ProfitStatsKPIs;
    byDate: ProfitStatsByDate[];
}

export interface ProfitStatsParams {
    ZoneId: string;
    PondIds?: string[];
    PondCategoryIds?: string[];
    SeasonId?: string;
    Id?: string;
}

export type ProfitStatsResponse = IApiResponse<ProfitStatsData>;

// ===== Component Props =====
export interface CompilationProfitChartProps {
    zoneId: string;
    pondId?: string;
    seasonId?: string;
}
