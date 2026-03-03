import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetPondOperationsParams,
    GetPondOperationsResponse,
} from '@/features/farm/types/pondOperation.types';

export const pondOperationApi = {
    getPondOperations: async (
        params?: GetPondOperationsParams
    ): Promise<GetPondOperationsResponse> => {
        const { data } = await apiClient.get<GetPondOperationsResponse>(
            API_ENDPOINTS.POND_OPERATION.LIST,
            {
                params: {
                    PageSize: 100,
                    Page: 1,
                    ...params,
                },
            }
        );
        return data;
    },
};
