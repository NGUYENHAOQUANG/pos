import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { FeedProdResponse } from '../types/feeding-production';
import { HarvestStatsResponse } from '../types/harvest-stats';
import { ProfitStatsResponse } from '../types/profit-stats';

export const reportApi = {
    getFeedingProduction: async (params: {
        ZoneId: string;
        Id?: string; // SeasonId or PondId depending on context
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
};
