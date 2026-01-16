import { useQuery } from '@tanstack/react-query';
import { materialGroupApi } from '@/features/material/api/materialGroupApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';

// Constants for pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

// Constants for staleTime (in milliseconds)
const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch material groups
 */
export const useMaterialGroups = () => {
    return useQuery({
        queryKey: materialKeys.groups(),
        queryFn: async () => {
            const response = await materialGroupApi.getAll({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });
            if (response.result && response.data?.items) {
                return response.data.items;
            }
            throw new Error(response.message || 'Không thể tải nhóm vật tư');
        },
        staleTime: STALE_TIME_LONG,
    });
};
