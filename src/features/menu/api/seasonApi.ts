import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { SeasonPayload } from '@/features/menu/services/aquacultureService';
import { IPaginate } from '@/shared/types/common.types';

/** Params for paginated season list */
interface GetSeasonsParams {
    Page?: number;
    PageSize?: number;
}

export const seasonApi = {
    getSeasons: async (
        zoneId: string,
        params?: GetSeasonsParams
    ): Promise<IPaginate<SeasonData>> => {
        const url = API_ENDPOINTS.ZONE.SEASONS.LIST(zoneId);
        const response = await apiClient.get(url, { params });
        const responseData = response.data;

        // Handle paginated response: { data: { items, pageNumber, hasNextPage, ... } }
        if (responseData?.data?.items && Array.isArray(responseData.data.items)) {
            return responseData.data;
        }

        // Fallback: wrap raw array into paginated shape (API without pagination support)
        let items: SeasonData[] = [];
        if (Array.isArray(responseData)) {
            items = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
            items = responseData.data;
        } else if (responseData?.result && Array.isArray(responseData.result)) {
            items = responseData.result;
        } else if (responseData?.items && Array.isArray(responseData.items)) {
            items = responseData.items;
        }

        return {
            items,
            pageNumber: 1,
            totalPages: 1,
            totalCount: items.length,
            pageSize: items.length,
            hasPreviousPage: false,
            hasNextPage: false,
        };
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

    updateSeason: async (zoneId: string, id: string, data: SeasonPayload): Promise<SeasonData> => {
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

    createSeason: async (zoneId: string, data: SeasonPayload): Promise<SeasonData> => {
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
