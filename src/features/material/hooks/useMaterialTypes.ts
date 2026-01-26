import { useQuery } from '@tanstack/react-query';
import { materialTypeApi } from '@/features/material/api/materialTypeApi';
import { useMaterialGroups } from './useMaterialGroups';
import { materialKeys } from './materialKeys';

// Constants for pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

// Constants for staleTime (in milliseconds)
const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch all material types
 */
export const useMaterialTypes = () => {
    return useQuery({
        queryKey: materialKeys.types(),
        queryFn: async () => {
            const response = await materialTypeApi.getList({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });
            if (response.success && response.data?.items) {
                return response.data.items;
            }
            throw new Error(response.message || 'Không thể tải loại vật tư');
        },
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to fetch material types by group name
 */
export const useMaterialTypesByGroup = (groupName: string | null) => {
    const { data: groups } = useMaterialGroups();

    return useQuery({
        queryKey: materialKeys.typesByGroup(groupName || ''),
        queryFn: async () => {
            if (!groupName || !groups) return [];

            const selectedGroup = groups.find(g => g.name === groupName);
            if (!selectedGroup) return [];

            const response = await materialTypeApi.getList({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });

            if (response.success && response.data?.items) {
                return (response.data.items || []).filter(item => {
                    const itemGroup = groups.find(g => g.id === String(item.materialGroupId));
                    return itemGroup?.name === selectedGroup.name;
                });
            }
            throw new Error(response.message || 'Không thể tải loại vật tư');
        },
        enabled: !!groupName && !!groups,
        staleTime: STALE_TIME_LONG,
    });
};
