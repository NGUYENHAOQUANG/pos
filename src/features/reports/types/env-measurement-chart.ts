import { IApiResponse } from '@/shared/types/common.types';

// ===== Request Params =====

export interface EnvMeasurementChartParams {
    ZoneId: string;
    MetricId?: string;
    PondCategoryIds?: string[];
    PondIds?: string[];
    CycleId?: string;
    FromDate?: string;
    ToDate?: string;
}

// ===== Response Data =====

export interface EnvChartDataPoint {
    date: string; // ISO 8601, e.g. "2026-03-10T17:00:00.0000000Z"
    value: number;
}

export interface EnvChartSeries {
    pondId: string;
    pondName: string;
    averageValue: number;
    data: EnvChartDataPoint[];
}

export interface EnvChartMetadata {
    minY: number;
    maxY: number;
    xAxis: string[]; // ISO 8601 date strings
}

export interface EnvMeasurementChartData {
    metadata: EnvChartMetadata;
    series: EnvChartSeries[];
    name: string; // e.g. "pH", "DO"
    unitMetric: string; // e.g. "ph", "mg/L"
}

export type EnvMeasurementChartResponse = IApiResponse<EnvMeasurementChartData>;
