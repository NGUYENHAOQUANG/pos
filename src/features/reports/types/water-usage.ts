import { IApiResponse } from '@/shared/types/common.types';

export interface DailyWaterStat {
    date: string;
    totalWaterAdded: number;
    totalWaterRemoved: number;
    pondCount: number;
    maxWaterAdded: number;
    minWaterAdded: number;
    averageWaterAdded: number;
}

export interface WaterUsageKpi {
    totalDays: number;
    totalRecords: number;
    totalPonds: number;
    totalWaterAdded: number;
    totalWaterRemoved: number;
    averageDailyWaterAdded: number;
    maxDailyWaterAdded: number;
    minDailyWaterAdded: number;
    averageWaterPerPond: number;
}

export interface WaterUsageData {
    totalRecords: number;
    kpi: WaterUsageKpi;
    days: DailyWaterStat[];
}

export type WaterUsageResponse = IApiResponse<WaterUsageData>;
