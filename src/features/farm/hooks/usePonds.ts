import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { pondApi } from '@/features/farm/api/pondApi';
import { farmKeys } from './farmKeys';
import { PondData } from '@/features/farm/types/farm.types';

export const usePondMasterData = () => {
    return useQuery({
        queryKey: farmKeys.masterData.types(),
        queryFn: async () => {
            const [types, operations] = await Promise.all([
                pondApi.getPondTypes(),
                pondApi.getPondTypeOperations(),
            ]);
            return { types, operations };
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (static data)
    });
};

export const usePondsByZone = (zoneId: number | null) => {
    const { data: masterData, isLoading: isLoadingMaster } = usePondMasterData();

    const query = useInfiniteQuery({
        queryKey: farmKeys.ponds.byZone(zoneId || 'all'),
        queryFn: async ({ pageParam = 1 }) => {
            if (!zoneId) return { items: [], total: 0 };

            // Just fetch raw data, don't map here to avoid stale closure issues
            const response = await pondApi.getPondsByZone(zoneId, {
                PageSize: 100,
                PageNumber: pageParam,
            });

            return {
                items: response.items || [],
                total: response.total,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
            if (loadedCount < lastPage.total) {
                return allPages.length + 1;
            }
            return undefined;
        },
        enabled: !!zoneId,
        staleTime: 5 * 60 * 1000,
    });

    // Reactive Mapping: Map pond types whenever masterData or query data changes
    // This fixes the issue where types were missing if masterData loaded after ponds
    const mappedData = useMemo(() => {
        if (!query.data) return query.data;

        const newPages = query.data.pages.map(page => ({
            ...page,
            items: page.items.map((pond: any) => {
                const mappedPond = { ...pond };
                if (masterData?.types) {
                    // Try to find type by ID first (API usually returns pondTypeId)
                    const typeId = pond.pondTypeId;
                    if (typeId) {
                        const matchedType = masterData.types.find(t => t.id === typeId);
                        if (matchedType) mappedPond.type = matchedType;
                    }
                }
                return mappedPond as PondData;
            }),
        }));

        return {
            ...query.data,
            pages: newPages,
        };
    }, [query.data, masterData]);

    // Merge loading state: isLoading is true if either ponds OR master data is loading
    // This ensures skeleton persists until we have Types to map
    return {
        ...query,
        data: mappedData, // Return the mapped data
        isLoading: query.isLoading || isLoadingMaster || (!masterData && !!zoneId),
    };
};
