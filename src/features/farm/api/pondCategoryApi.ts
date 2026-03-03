import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetPondCategoriesParams, GetPondCategoriesResponse } from '../types/pond-category.types';

export const pondCategoryApi = {
    getPondCategories: async (
        params?: GetPondCategoriesParams
    ): Promise<GetPondCategoriesResponse> => {
        const endpoint = API_ENDPOINTS.POND_TYPES.LIST;

        const { data } = await apiClient.get<GetPondCategoriesResponse>(endpoint, {
            params,
        });

        return data;
    },
};
