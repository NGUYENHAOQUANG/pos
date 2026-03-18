import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICleanRenovationResponse,
    ICleanRenovationDetail,
    ICleanRenovationParams,
    ICleanRenovationCreateResponse,
    ICleanRenovationUpdateResponse,
    ICleanRenovationDeleteResponse,
} from '@/features/farm/types/cleanRenovation.types';

export const cleanRenovationApi = {
    getAll: async (pondId: string, params?: ICleanRenovationParams) => {
        const { data } = await apiClient.get<ICleanRenovationResponse>(
            API_ENDPOINTS.POND.CLEAN_RENOVATION.LIST(pondId),
            {
                params: { ...params },
            }
        );
        return data;
    },

    getById: async (pondId: string, id: string) => {
        const { data } = await apiClient.get<ICleanRenovationDetailResponse>(
            API_ENDPOINTS.POND.CLEAN_RENOVATION.DETAIL(pondId, id)
        );
        return data;
    },

    create: async (pondId: string, detail: ICleanRenovationDetail, documentIds?: string[]) => {
        const { data } = await apiClient.post<ICleanRenovationCreateResponse>(
            API_ENDPOINTS.POND.CLEAN_RENOVATION.CREATE(pondId),
            {
                pondId,
                cleanRenovationDetail: detail,
                documentIds,
            }
        );
        return data;
    },

    update: async (
        pondId: string,
        id: string,
        detail: ICleanRenovationDetail,
        documentIds?: string[]
    ) => {
        const { data } = await apiClient.patch<ICleanRenovationUpdateResponse>(
            API_ENDPOINTS.POND.CLEAN_RENOVATION.UPDATE(pondId, id),
            {
                cleanRenovationDetail: detail,
                documentIds,
            }
        );
        return data;
    },

    delete: async (pondId: string, id: string) => {
        const { data } = await apiClient.delete<ICleanRenovationDeleteResponse>(
            API_ENDPOINTS.POND.CLEAN_RENOVATION.DELETE(pondId, id)
        );
        return data;
    },
};
