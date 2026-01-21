import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { SeasonData } from '@/features/farm/types/farm.types';

export const seasonApi = {
    getSeasons: async (zoneId: number | string): Promise<SeasonData[]> => {
        const url = API_ENDPOINTS.PRODUCTION_SEASONS.LIST(zoneId);
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

        const resData = response.data;
        if (resData?.result === false || (resData?.statusCode && resData.statusCode >= 400)) {
            let message = resData?.message || 'Cập nhật vụ nuôi thất bại';
            if (message === 'Season name already exists.') {
                message = 'Tên vụ nuôi đã tồn tại';
            }
            throw new Error(message);
        }

        return resData;
    },

    deleteSeason: async (zoneId: number | string, id: string): Promise<void> => {
        const response = await apiClient.delete(
            API_ENDPOINTS.PRODUCTION_SEASONS.DELETE(zoneId, id)
        );
        const resData = response.data;
        if (resData?.result === false || (resData?.statusCode && resData.statusCode >= 400)) {
            let message = resData?.message || 'Xóa vụ nuôi thất bại';
            // Translate common errors if needed
            throw new Error(message);
        }
    },

    createSeason: async (
        zoneId: number | string,
        data: Partial<SeasonData>
    ): Promise<SeasonData> => {
        const response = await apiClient.post(
            API_ENDPOINTS.PRODUCTION_SEASONS.CREATE(zoneId),
            data
        );

        const resData = response.data;
        if (resData?.result === false || (resData?.statusCode && resData.statusCode >= 400)) {
            let message = resData?.message || 'Tạo vụ nuôi thất bại';
            if (message === 'Season name already exists.') {
                message = 'Tên vụ nuôi đã tồn tại';
            }
            throw new Error(message);
        }

        return response.data;
    },
};
