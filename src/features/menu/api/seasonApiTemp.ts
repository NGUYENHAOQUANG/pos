import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface ISeasonListParams {
    Page?: number;
    PageSize?: number;
    SortBy?: string;
    SortDir?: 'Asc' | 'Desc';
    [key: string]: any;
}

export const seasonApiTemp = {
    getSeasons: async (
        zoneId: string,
        params?: ISeasonListParams
    ): Promise<IApiResponse<IPaginate<SeasonData>>> => {
        const url = API_ENDPOINTS.ZONE.SEASONS.LIST(zoneId);
        const response = await apiClient.get<IApiResponse<IPaginate<SeasonData>>>(url, { params });
        return response.data;
    },

    getSeasonDetail: async (zoneId: string, id: string): Promise<IApiResponse<SeasonData>> => {
        const response = await apiClient.get<IApiResponse<SeasonData>>(
            API_ENDPOINTS.ZONE.SEASONS.DETAIL(zoneId, id)
        );
        return response.data;
    },

    updateSeason: async (
        zoneId: string,
        id: string,
        data: Partial<SeasonData>
    ): Promise<IApiResponse<SeasonData>> => {
        const response = await apiClient.patch<IApiResponse<SeasonData>>(
            API_ENDPOINTS.ZONE.SEASONS.UPDATE(zoneId, id),
            data
        );
        return response.data;
    },

    updateSeasonStatus: async (
        zoneId: string,
        id: string,
        status: SeasonStatus
    ): Promise<IApiResponse<boolean>> => {
        const payload = { status };
        const response = await apiClient.post<IApiResponse<boolean>>(
            API_ENDPOINTS.ZONE.SEASONS.STATUS(zoneId, id),
            payload
        );
        return response.data;
    },

    deleteSeason: async (zoneId: string, id: string): Promise<IApiResponse<boolean>> => {
        const response = await apiClient.delete<IApiResponse<boolean>>(
            API_ENDPOINTS.ZONE.SEASONS.DELETE(zoneId, id)
        );
        return response.data;
    },

    createSeason: async (
        zoneId: string,
        data: Partial<SeasonData>
    ): Promise<IApiResponse<SeasonData>> => {
        const response = await apiClient.post<IApiResponse<SeasonData>>(
            API_ENDPOINTS.ZONE.SEASONS.CREATE(zoneId),
            data
        );
        return response.data;
    },
};
