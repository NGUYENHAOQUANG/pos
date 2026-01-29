import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICreateSizeMeasurementReq,
    IUpdateSizeMeasurementReq,
    ISizeMeasurementParams,
    GetSizeMeasurementsResponse,
    SizeMeasurementResponse,
} from '@/features/farm/types/sizeMeasurement.types';

export const sizeMeasurementApi = {
    getAll: async (
        pondId: string,
        params?: ISizeMeasurementParams
    ): Promise<GetSizeMeasurementsResponse> => {
        const response = await apiClient.get<GetSizeMeasurementsResponse>(
            API_ENDPOINTS.POND.SIZE_MEASUREMENT.LIST(pondId),
            {
                params,
            }
        );
        return response.data;
    },

    getDetail: async (pondId: string, id: string): Promise<SizeMeasurementResponse> => {
        const response = await apiClient.get<SizeMeasurementResponse>(
            API_ENDPOINTS.POND.SIZE_MEASUREMENT.DETAIL(pondId, id)
        );
        return response.data;
    },

    create: async (
        pondId: string,
        data: ICreateSizeMeasurementReq
    ): Promise<SizeMeasurementResponse> => {
        const response = await apiClient.post<SizeMeasurementResponse>(
            API_ENDPOINTS.POND.SIZE_MEASUREMENT.CREATE(pondId),
            data
        );
        return response.data;
    },

    update: async (
        pondId: string,
        id: string,
        data: IUpdateSizeMeasurementReq
    ): Promise<SizeMeasurementResponse> => {
        const response = await apiClient.patch<SizeMeasurementResponse>(
            API_ENDPOINTS.POND.SIZE_MEASUREMENT.UPDATE(pondId, id),
            data
        );
        return response.data;
    },

    delete: async (pondId: string, id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.POND.SIZE_MEASUREMENT.DELETE(pondId, id));
    },
};
