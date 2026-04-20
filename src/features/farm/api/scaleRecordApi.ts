import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    IStartScaleSessionRequest,
    StartScaleSessionResponse,
    IScaleRecordParams,
    GetScaleRecordsResponse,
    IConfirmScaleRecordRequest,
    IFinishScaleSessionRequest,
    IDiscardScaleSessionRequest,
} from '@/features/farm/types/scaleRecord.types';

export const scaleRecordApi = {
    startSession: async (data: IStartScaleSessionRequest): Promise<StartScaleSessionResponse> => {
        const response = await apiClient.post<StartScaleSessionResponse>(
            API_ENDPOINTS.SCALE_RECORD.START_SESSION,
            data
        );
        return response.data;
    },
    getAll: async (params?: IScaleRecordParams): Promise<GetScaleRecordsResponse> => {
        const response = await apiClient.get<GetScaleRecordsResponse>(
            API_ENDPOINTS.SCALE_RECORD.LIST,
            { params }
        );
        return response.data;
    },
    confirm: async (data: IConfirmScaleRecordRequest): Promise<any> => {
        const response = await apiClient.post(API_ENDPOINTS.SCALE_RECORD.CONFIRM, data);
        return response.data;
    },
    finishSession: async (data: IFinishScaleSessionRequest): Promise<any> => {
        const response = await apiClient.post(API_ENDPOINTS.SCALE_RECORD.FINISH_SESSION, data);
        return response.data;
    },
    discardSession: async (data: IDiscardScaleSessionRequest): Promise<any> => {
        const response = await apiClient.post(API_ENDPOINTS.SCALE_RECORD.DISCARD, data);
        return response.data;
    },
    softDelete: async (id: string, deleteNote: string = ''): Promise<any> => {
        const response = await apiClient.patch(API_ENDPOINTS.SCALE_RECORD.SOFT_DELETE(id), {
            deleteNote,
        });
        return response.data;
    },
};
