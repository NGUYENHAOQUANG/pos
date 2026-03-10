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

export interface ProfitStatsResponse {
    success: boolean;
    data: ProfitStatsData;
    message: string | null;
}
