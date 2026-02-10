import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICreateHarvestRecordReq,
    IUpdateHarvestRecordReq,
    IHarvestRecordParams,
    GetHarvestRecordsResponse,
    HarvestRecordResponse,
    DeleteHarvestRecordResponse,
} from '@/features/farm/types/harvestRecord.types';

export const harvestRecordApi = {
    getAll: async (
        pondId: string,
        params?: IHarvestRecordParams
    ): Promise<GetHarvestRecordsResponse> => {
        const response = await apiClient.get<GetHarvestRecordsResponse>(
            API_ENDPOINTS.POND.HARVEST_RECORDS.LIST(pondId),
            {
                params,
            }
        );
        return response.data;
    },

    getDetail: async (pondId: string, id: string): Promise<HarvestRecordResponse> => {
        const response = await apiClient.get<HarvestRecordResponse>(
            API_ENDPOINTS.POND.HARVEST_RECORDS.DETAIL(pondId, id)
        );
        return response.data;
    },

    create: async (
        pondId: string,
        data: ICreateHarvestRecordReq
    ): Promise<HarvestRecordResponse> => {
        const response = await apiClient.post<HarvestRecordResponse>(
            API_ENDPOINTS.POND.HARVEST_RECORDS.CREATE(pondId),
            data
        );
        return response.data;
    },

    update: async (
        pondId: string,
        id: string,
        data: IUpdateHarvestRecordReq
    ): Promise<HarvestRecordResponse> => {
        const response = await apiClient.patch<HarvestRecordResponse>(
            API_ENDPOINTS.POND.HARVEST_RECORDS.UPDATE(pondId, id),
            data
        );
        return response.data;
    },

    delete: async (pondId: string, id: string): Promise<DeleteHarvestRecordResponse> => {
        const response = await apiClient.delete<DeleteHarvestRecordResponse>(
            API_ENDPOINTS.POND.HARVEST_RECORDS.DELETE(pondId, id)
        );
        return response.data;
    },
};
