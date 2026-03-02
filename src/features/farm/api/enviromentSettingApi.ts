import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IPaginate } from '@/shared/types/common.types';
import {
    EnvironmentSetting,
    GetEnvironmentSettingsParams,
    GetEnvironmentSettingsResponse,
    CreateEnvironmentSettingRequest,
    CreateEnvironmentSettingResponse,
    GetEnvironmentSettingDetailResponse,
    UpdateEnvironmentSettingRequest,
    UpdateEnvironmentSettingResponse,
    DeleteEnvironmentSettingResponse,
} from '@/features/farm/types/environmentSettings.types';

export const environmentSettingApi = {
    getSettings: async (
        zoneId: string,
        params?: GetEnvironmentSettingsParams
    ): Promise<IPaginate<EnvironmentSetting>> => {
        const { data } = await apiClient.get<GetEnvironmentSettingsResponse>(
            API_ENDPOINTS.PARAMETER_SETTING.LIST(zoneId),
            { params }
        );
        return data.data;
    },

    getDetail: async (zoneId: string, id: string): Promise<EnvironmentSetting> => {
        const { data } = await apiClient.get<GetEnvironmentSettingDetailResponse>(
            API_ENDPOINTS.PARAMETER_SETTING.DETAIL(zoneId, id)
        );
        return data.data;
    },

    create: async (
        zoneId: string,
        data: CreateEnvironmentSettingRequest
    ): Promise<CreateEnvironmentSettingResponse> => {
        const response = await apiClient.post<CreateEnvironmentSettingResponse>(
            API_ENDPOINTS.PARAMETER_SETTING.CREATE(zoneId),
            data
        );
        return response.data;
    },

    update: async (
        zoneId: string,
        id: string,
        data: UpdateEnvironmentSettingRequest
    ): Promise<UpdateEnvironmentSettingResponse> => {
        const response = await apiClient.patch<UpdateEnvironmentSettingResponse>(
            API_ENDPOINTS.PARAMETER_SETTING.UPDATE(zoneId, id),
            data
        );
        return response.data;
    },

    delete: async (zoneId: string, id: string): Promise<DeleteEnvironmentSettingResponse> => {
        const response = await apiClient.delete<DeleteEnvironmentSettingResponse>(
            API_ENDPOINTS.PARAMETER_SETTING.DELETE(zoneId, id)
        );
        return response.data;
    },
};
