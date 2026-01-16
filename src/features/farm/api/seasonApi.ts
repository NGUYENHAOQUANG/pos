import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { SeasonData } from '@/features/farm/types/farm.types';

export const seasonApi = {
    getSeasons: async (zoneId: number | string): Promise<SeasonData[]> => {
        const url = API_ENDPOINTS.PRODUCTION_SEASONS.LIST(zoneId);
        try {
            const response = await apiClient.get(url);
            const responseData = response.data;

            // Check for nested data.items structure (pagination response)
            if (responseData?.data?.items && Array.isArray(responseData.data.items)) {
                return responseData.data.items;
            }
            if (Array.isArray(responseData)) {
                return responseData;
            }
            if (responseData?.data && Array.isArray(responseData.data)) {
                return responseData.data;
            }
            if (responseData?.result && Array.isArray(responseData.result)) {
                return responseData.result;
            }
            if (responseData?.items && Array.isArray(responseData.items)) {
                return responseData.items;
            }

            return [];
        } catch (_error) {
            // Return empty array to avoid breaking Promise.all when one zone fails
            return [];
        }
    },
    getSeasonDetail: async (zoneId: number | string, id: string): Promise<SeasonData> => {
        const response = await apiClient.get(API_ENDPOINTS.PRODUCTION_SEASONS.DETAIL(zoneId, id));
        return response.data;
    },

    updateSeason: async (
        zoneId: number | string,
        id: string,
        data: Partial<SeasonData>
    ): Promise<SeasonData> => {
        const response = await apiClient.put(
            API_ENDPOINTS.PRODUCTION_SEASONS.UPDATE(zoneId, id),
            data
        );
        return response.data;
    },

    deleteSeason: async (zoneId: number | string, id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.PRODUCTION_SEASONS.DELETE(zoneId, id));
    },

    createSeason: async (
        zoneId: number | string,
        data: Partial<SeasonData>
    ): Promise<SeasonData> => {
        const response = await apiClient.post(
            API_ENDPOINTS.PRODUCTION_SEASONS.CREATE(zoneId),
            data
        );
        return response.data;
    },
};
