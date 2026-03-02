import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    IDryRenovationResponse,
    IDryRenovationDetail,
    IDryRenovationParams,
    IDryRenovationDetailResponse,
    IDryRenovationCreateResponse,
    IDryRenovationUpdateResponse,
    IDryRenovationDeleteResponse,
} from '@/features/farm/types/dryRenovation.types';

export const dryRenovationApi = {
    getAll: async (pondId: string, params?: IDryRenovationParams) => {
        const { data } = await apiClient.get<IDryRenovationResponse>(
            API_ENDPOINTS.POND.DRY_RENOVATION.LIST(pondId),
            {
                params: { ...params },
            }
        );
        return data;
    },

    getById: async (pondId: string, id: string) => {
        const { data } = await apiClient.get<IDryRenovationDetailResponse>(
            API_ENDPOINTS.POND.DRY_RENOVATION.DETAIL(pondId, id)
        );
        return data;
    },

    create: async (pondId: string, detail: IDryRenovationDetail, documentIds?: string[]) => {
        const { data } = await apiClient.post<IDryRenovationCreateResponse>(
            API_ENDPOINTS.POND.DRY_RENOVATION.CREATE(pondId),
            {
                pondId,
                dryRenovationDetail: detail,
                documentIds,
            }
        );
        return data;
    },

    update: async (
        pondId: string,
        id: string,
        detail: IDryRenovationDetail,
        documentIds?: string[]
    ) => {
        const { data } = await apiClient.patch<IDryRenovationUpdateResponse>(
            API_ENDPOINTS.POND.DRY_RENOVATION.UPDATE(pondId, id),
            {
                dryRenovationDetail: detail,
                documentIds,
            }
        );
        return data;
    },

    delete: async (pondId: string, id: string) => {
        const { data } = await apiClient.delete<IDryRenovationDeleteResponse>(
            API_ENDPOINTS.POND.DRY_RENOVATION.DELETE(pondId, id)
        );
        return data;
    },
};
