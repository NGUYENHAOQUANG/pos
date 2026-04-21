import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetScalesResponse,
    IScaleParams,
    ScaleResponse,
    IUpdateScaleUsageStatusRequest,
} from '@/features/farm/types/scale.types';
import { IApiResponse } from '@/shared/types/common.types';

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

    updateUsageStatus: async (
        data: IUpdateScaleUsageStatusRequest
    ): Promise<IApiResponse<null>> => {
        const response = await apiClient.patch<IApiResponse<null>>(
            API_ENDPOINTS.SCALE.USAGE_STATUS,
            data
        );
        return response.data;
    },
};
