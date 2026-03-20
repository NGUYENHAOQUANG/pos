import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICreateEnvMeasurementReq,
    IUpdateEnvMeasurementReq,
    IEnvMeasurementParams,
    EnvMeasurementResponse,
    GetEnvMeasurementsResponse,
    EnvCreateUpdateResponse,
} from '@/features/farm/types/envMeasurement.types';

export const environmentApi = {
    getEnvMeasurements: async (
        pondId: string,
        params?: IEnvMeasurementParams
    ): Promise<GetEnvMeasurementsResponse> => {
        const response = await apiClient.get<GetEnvMeasurementsResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.LIST(pondId),
            { params }
        );
        return response.data;
    },

    getEnvMeasurementDetail: async (
        pondId: string,
        id: string
    ): Promise<EnvMeasurementResponse> => {
        const response = await apiClient.get<EnvMeasurementResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.DETAIL(pondId, id)
        );
        return response.data;
    },

    createEnvMeasurement: async (
        pondId: string,
        data: ICreateEnvMeasurementReq
    ): Promise<EnvCreateUpdateResponse> => {
        const response = await apiClient.post<EnvCreateUpdateResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.CREATE(pondId),
            data
        );
        return response.data;
    },

    updateEnvMeasurement: async (
        pondId: string,
        id: string,
        data: IUpdateEnvMeasurementReq
    ): Promise<EnvCreateUpdateResponse> => {
        const response = await apiClient.patch<EnvCreateUpdateResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.UPDATE(pondId, id),
            data
        );
        return response.data;
    },

    deleteEnvMeasurement: async (pondId: string, id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.POND.ENV_MEASUREMENT.DELETE(pondId, id));
    },
};
