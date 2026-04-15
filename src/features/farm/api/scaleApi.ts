import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetScalesResponse, IScaleParams, ScaleResponse } from '@/features/farm/types/scale.types';

export const scaleApi = {
    getAll: async (params?: IScaleParams): Promise<GetScalesResponse> => {
        const response = await apiClient.get<GetScalesResponse>(API_ENDPOINTS.SCALE.LIST, {
            params,
        });
        return response.data;
    },

    getDetail: async (id: string): Promise<ScaleResponse> => {
        const response = await apiClient.get<ScaleResponse>(API_ENDPOINTS.SCALE.DETAIL(id));
        return response.data;
    },
};
