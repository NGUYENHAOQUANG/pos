import { useQuery } from '@tanstack/react-query';
import { pondCategoryApi } from '@/features/farm/api/pondCategoryApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { GetPondCategoriesParams } from '@/features/farm/types/pond-category.types';

/**
 * Fetch a single page of pond categories (useful for dropdowns or short lists).
 */
export const usePondCategories = (params?: GetPondCategoriesParams) => {
    return useQuery({
        queryKey: farmKeys.pondCategories.list(params),
        queryFn: async () => {
            const defaultParams: GetPondCategoriesParams = {
                PageSize: 100,
                Page: 1,
                ...params,
            };
            const response = await pondCategoryApi.getPondCategories(defaultParams);
            return response.data;
        },
        staleTime: 60 * 60 * 1000,
    });
};
