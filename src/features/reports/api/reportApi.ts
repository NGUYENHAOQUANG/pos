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
    }): Promise<HarvestStatsResponse> => {
        const { data } = await apiClient.get<HarvestStatsResponse>(
            API_ENDPOINTS.REPORT.HARVEST_STATS,
            {
                params,
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
        startDate?: string;
        endDate?: string;
    }): Promise<WaterUsageResponse> => {
        const { data } = await apiClient.get<WaterUsageResponse>(
            API_ENDPOINTS.REPORT.DAILY_WATER_STATS,
            {
                params,
            }
        );
        return data;
    },
};
