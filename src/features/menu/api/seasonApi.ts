import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';

export const seasonApi = {
    getSeasons: async (zoneId: string): Promise<SeasonData[]> => {
        const url = API_ENDPOINTS.ZONE.SEASONS.LIST(zoneId);
        const response = await apiClient.get(url);
        const responseData = response.data;
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
    getSeasonDetail: async (zoneId: string, id: string): Promise<SeasonData> => {
        const response = await apiClient.get(API_ENDPOINTS.ZONE.SEASONS.DETAIL(zoneId, id));
        const resData = response.data;
        if (resData?.data) {
            return resData.data;
        }
        if (resData?.result && typeof resData.result === 'object') {
            return resData.result;
        }
        return resData;
    },

    updateSeason: async (
        zoneId: string,
        id: string,
        data: Partial<SeasonData>
    ): Promise<SeasonData> => {
        const response = await apiClient.patch(API_ENDPOINTS.ZONE.SEASONS.UPDATE(zoneId, id), data);

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

    updateSeasonStatus: async (
        zoneId: string,
        id: string,
        status: SeasonStatus
    ): Promise<{ success: boolean; message?: string }> => {
        const payload = { status };
        const response = await apiClient.post(
            API_ENDPOINTS.ZONE.SEASONS.STATUS(zoneId, id),
            payload
        );
        const resData = response.data;
        if (
            resData?.success === false ||
            (resData?.statusCode && resData.statusCode >= 400) ||
            resData?.result === false
        ) {
            const message = resData?.message || 'Cập nhật trạng thái thất bại';
            throw new Error(message);
        }

        return {
            success: true,
            message: resData?.message,
        };
    },

    deleteSeason: async (zoneId: string, id: string): Promise<void> => {
        const response = await apiClient.delete(API_ENDPOINTS.ZONE.SEASONS.DELETE(zoneId, id));
        const resData = response.data;
        if (resData?.result === false || (resData?.statusCode && resData.statusCode >= 400)) {
            let message = resData?.message || 'Xóa vụ nuôi thất bại';
            // Translate common errors if needed
            throw new Error(message);
        }
    },

    createSeason: async (zoneId: string, data: Partial<SeasonData>): Promise<SeasonData> => {
        const response = await apiClient.post(API_ENDPOINTS.ZONE.SEASONS.CREATE(zoneId), data);

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
