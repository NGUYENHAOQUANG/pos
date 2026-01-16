import { useQuery } from '@tanstack/react-query';
import { unitApi } from '@/features/material/api/unitApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';

// Constants for staleTime (in milliseconds)
const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch units
 */
export const useUnits = () => {
    return useQuery({
        queryKey: materialKeys.units(),
        queryFn: async () => {
            const response = await unitApi.getUnits();
            if (response.data && response.data.items) {
                return response.data.items;
            }
            throw new Error('Không thể tải đơn vị tính');
        },
        staleTime: STALE_TIME_LONG,
    });
};
