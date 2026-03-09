import { ApiResponse } from '@/core/api/client';

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

export type ProductionDistributionResponse = ApiResponse<ProductionDistributionData>;
