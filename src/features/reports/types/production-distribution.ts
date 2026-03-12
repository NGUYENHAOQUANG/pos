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

export interface ProductionDocData {
    label: string;
    remainingAmount: number;
    harvestedAmount: number;
    remainingPercent: number;
    totalAmount: number;
}

export interface ProductionDistributionData {
    summary: ProductionSummary;
    areaData: ProductionAreaData[];
    docData: ProductionDocData[];
}

export interface ProductionDistributionParams {
    ZoneId: string;
    Id?: string;
}

export type ProductionDistributionResponse = IApiResponse<ProductionDistributionData>;

// ----------------------------------------------------------------------
// CHART TYPES
// ----------------------------------------------------------------------

/** Single bar item data for chart rendering */
export type ProdChartItemData = { value: number; color: string; label: string } | null;

/** Group of bar items with an x-axis label */
export interface ProdChartGroupData {
    label: string;
    items: ProdChartItemData[];
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

/** Scale calculation result */
export interface ProdChartScale {
    yMax: number;
    yLabels: string[];
}

/** Hook return type for production chart data */
export interface UseProdChartDataResult {
    /** Whether data is loading */
    isLoading: boolean;
    /** Summary data (harvested / remaining) */
    summary: ProductionSummary | undefined;
    /** Grouped chart data for active tab */
    activeData: ProdChartGroupData[];
    /** Y-axis labels */
    yLabels: string[];
    /** Maximum value for Y-axis scale */
    yMax: number;
    /** Dynamic chart height */
    chartHeight: number;
}
