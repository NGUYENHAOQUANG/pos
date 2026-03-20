import { IApiResponse } from '@/shared/types/common.types';

// ----------------------------------------------------------------------
// API TYPES
// ----------------------------------------------------------------------

export interface ProductionSummary {
    totalRemaining: number;
    totalHarvested: number;
    unit: string;
}

export interface ProductionAreaData {
    label: string;
    remainingAmount: number;
    harvestedAmount: number;
    remainingPercent: number;
    totalAmount: number;
}

export interface ProductionDistributionData {
    summary: ProductionSummary;
    areaData: ProductionAreaData[];
    docData: ProductionAreaData[];
}

export interface ProductionDistributionParams {
    ZoneId: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type ProductionDistributionResponse = IApiResponse<ProductionDistributionData>;

// ----------------------------------------------------------------------
// CHART TYPES
// ----------------------------------------------------------------------

/** Single bar item data for chart rendering */
export type ProdChartItemData = { value: number; color: string } | null;

/** Group of bar items with an x-axis label */
export interface ProdChartGroupData {
    label: string;
    items: ProdChartItemData[];
}

/** Legend item for summary cards */
export interface ProdLegendItem {
    label: string;
    color: string;
}

/** Summary card data for display */
export interface ProdSummaryCardData {
    title: string;
    value: number;
    unit: string;
    legends: ProdLegendItem[];
}

/** Props for the VisualChart sub-component */
export interface ProdVisualChartProps {
    data: ProdChartGroupData[];
    yLabels: string[];
    maxValue: number;
    height?: number;
    barWidth?: number;
}

/** Props for the ProdChart main component */
export interface ProdChartProps {
    zoneId: string;
    pondId?: string;
}

/** Hook return type for production chart data */
export interface UseProdChartDataResult {
    /** Whether data is loading */
    isLoading: boolean;
    /** Grouped chart data for active tab */
    activeData: ProdChartGroupData[];
    /** Y-axis labels */
    yLabels: string[];
    /** Maximum value for Y-axis scale */
    yMax: number;
    /** Dynamic chart height */
    chartHeight: number;
    /** Summary cards with legends */
    summaryCards: ProdSummaryCardData[];
}
