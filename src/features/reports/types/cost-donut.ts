export interface CostDonutChartDataItem {
    categoryName: string;
    amount: number;
    percentage: number;
}

export interface CostDonutSummary {
    totalFoodUsage: number;
    totalCost: number;
    fcr: number;
    weightUnit: string;
    currencyUnit: string;
}

export interface CostDonutData {
    summary: CostDonutSummary;
    chartData: CostDonutChartDataItem[];
}

export interface CostDonutResponse {
    success: boolean;
    data: CostDonutData;
    message: string;
    errorCode: string | null;
    validationErrors: unknown;
    details: unknown;
    timestamp: string;
}

export interface CostDonutParams {
    ZoneId: string;
    PondCategoryIds?: string[];
    PondIds?: string[];
    CycleId?: string;
}

// ===== Component Props =====

export interface CompilationCostChartProps {
    zoneId: string;
    pondId?: string;
}
