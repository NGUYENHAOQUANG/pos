import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { FeedProdResponse } from '../types/feeding-production';
import { HarvestStatsResponse } from '../types/harvest-stats';
import { HarvestStatsTableParams, HarvestStatsTableResponse } from '../types/harvest-stats-table';
import {
    PondStatusDistributionParams,
    PondStatusDistributionResponse,
} from '../types/pond-status-distribution';
import { ProfitStatsResponse } from '../types/profit-stats';
import {
    StockTransferStatsParams,
    StockTransferStatsResponse,
} from '../types/stock-transfer-stats';
import { WaterUsageResponse } from '../types/water-usage';
import {
    ProductionDistributionParams,
    ProductionDistributionResponse,
} from '../types/production-distribution';
import { CostDonutParams, CostDonutResponse } from '../types/cost-donut';
import {
    EnvMeasurementChartParams,
    EnvMeasurementChartResponse,
} from '../types/env-measurement-chart';

export const reportApi = {
    getFeedingProduction: async (params: {
        ZoneId: string;
        Id?: string;
        CreatedAtFrom?: string;
        CreatedAtTo?: string;
    }): Promise<FeedProdResponse> => {
        const { data } = await apiClient.get<FeedProdResponse>(
            API_ENDPOINTS.REPORT.FEEDING_PRODUCTION,
            {
                params,
            }
        );
        return data;
    },
    getHarvestStats: async (params: {
        ZoneId: string;
        Id?: string;
        PondIds?: string[];
    }): Promise<HarvestStatsResponse> => {
        const { data } = await apiClient.get<HarvestStatsResponse>(
            API_ENDPOINTS.REPORT.HARVEST_STATS,
            {
                params,
                paramsSerializer: p => {
                    const parts: string[] = [];
                    Object.entries(p).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            value.forEach((v: string) =>
                                parts.push(`${key}=${encodeURIComponent(v)}`)
                            );
                        } else if (value !== undefined && value !== null) {
                            parts.push(`${key}=${encodeURIComponent(value)}`);
                        }
                    });
                    return parts.join('&');
                },
            }
        );
        return data;
    },
    getHarvestStatsTable: async (
        params: HarvestStatsTableParams
    ): Promise<HarvestStatsTableResponse> => {
        const response = await apiClient.get<HarvestStatsTableResponse>(
            API_ENDPOINTS.REPORT.HARVEST_STATS_TABLE,
            { params }
        );
        return response.data;
    },
    getPondStatusDistribution: async (
        params: PondStatusDistributionParams
    ): Promise<PondStatusDistributionResponse> => {
        const response = await apiClient.get<PondStatusDistributionResponse>(
            API_ENDPOINTS.REPORT.POND_STATUS_DISTRIBUTION,
            { params }
        );
        return response.data;
    },
    getProfitStats: async (params: {
        ZoneId: string;
        Id?: string;
    }): Promise<ProfitStatsResponse> => {
        const { data } = await apiClient.get<ProfitStatsResponse>(
            API_ENDPOINTS.REPORT.PROFIT_STATS,
            {
                params,
            }
        );
        return data;
    },
    getStockTransferStats: async (
        params: StockTransferStatsParams
    ): Promise<StockTransferStatsResponse> => {
        const { data } = await apiClient.get<StockTransferStatsResponse>(
            API_ENDPOINTS.REPORT.STOCK_TRANSFER_STATS,
            { params }
        );
        return data;
    },
    /**
     * Get daily water usage statistics
     * @param params
     * @returns
     */
    getDailyWaterStats: async (params: {
        zoneId: string;
        pondIds?: string[];
        startDate?: string;
        endDate?: string;
    }): Promise<WaterUsageResponse> => {
        const queryParams: Record<string, any> = {
            ZoneId: params.zoneId,
        };
        if (params.startDate) queryParams.StartDate = params.startDate;
        if (params.endDate) queryParams.EndDate = params.endDate;
        if (params.pondIds?.length) queryParams.PondIds = params.pondIds;

        const { data } = await apiClient.get<WaterUsageResponse>(
            API_ENDPOINTS.REPORT.DAILY_WATER_STATS,
            {
                params: queryParams,
                paramsSerializer: p => {
                    const parts: string[] = [];
                    Object.entries(p).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            value.forEach((v: string) =>
                                parts.push(`${key}=${encodeURIComponent(v)}`)
                            );
                        } else if (value !== undefined && value !== null) {
                            parts.push(`${key}=${encodeURIComponent(value)}`);
                        }
                    });
                    return parts.join('&');
                },
            }
        );
        return data;
    },
    getProductionDistribution: async (
        params: ProductionDistributionParams
    ): Promise<ProductionDistributionResponse> => {
        const { data } = await apiClient.get<ProductionDistributionResponse>(
            API_ENDPOINTS.REPORT.PRODUCTION_DISTRIBUTION,
            {
                params,
            }
        );
        return data;
    },
    getEnvMeasurementChart: async (
        params: EnvMeasurementChartParams
    ): Promise<EnvMeasurementChartResponse> => {
        const { data } = await apiClient.get<EnvMeasurementChartResponse>(
            API_ENDPOINTS.REPORT.ENV_MEASUREMENT_CHART,
            { params }
        );
        return data;
    },
    getCostDonut: async (params: CostDonutParams): Promise<CostDonutResponse> => {
        const { data } = await apiClient.get<CostDonutResponse>(API_ENDPOINTS.REPORT.COST_DONUT, {
            params,
        });
        return data;
    },
};
