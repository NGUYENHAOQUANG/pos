import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { pondApi } from '@/features/farm/api/pondApi';
import { farmKeys } from './farmKeys';
import { PondData } from '@/features/farm/types/farm.types';

export const usePondMasterData = () => {
    const query = useQuery({
        queryKey: farmKeys.masterData.types(),
        queryFn: async () => {
            // Execute sequentially to handle errors independently
            const types = await pondApi.getPondTypes();
            let operations: any[] = [];
            try {
                operations = await pondApi.getPondTypeOperations();
            } catch {
                // Ignore failure
            }

            return { types, operations };
        },
        staleTime: 60 * 60 * 1000,
    });

    return query;
};

export const usePondsByZone = (zoneId: number | string | null) => {
    const { data: masterData, isLoading: isLoadingMaster } = usePondMasterData();

    const query = useInfiniteQuery({
        queryKey: farmKeys.ponds.byZone(zoneId || 'all'),
        queryFn: async ({ pageParam = 1 }) => {
            if (!zoneId) return { items: [], total: 0 };

            // Fetch raw data
            const response = await pondApi.getPondsByZone(zoneId, {
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
        staleTime: 5 * 60 * 1000, // 5 mins
    });

    // Reactive Mapping: Map pond types whenever masterData or query data changes
    const mappedData = useMemo(() => {
        if (!query.data) return query.data;

        const newPages = query.data.pages.map(page => ({
            ...page,
            items: page.items.map((pond: any) => {
                const mappedPond = { ...pond };
                if (masterData?.types) {
                    // Try to find type by ID first (API usually returns pondCategoryId)
                    const typeId = (pond as any).pondCategoryId;
                    if (typeId) {
                        const matchedType = masterData.types.find(t => t.id === typeId);
                        if (matchedType) {
                            mappedPond.type = matchedType;
                        } else {
                            // Fallback if type not found in master data but ID exists
                            mappedPond.type = typeId;
                        }
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

    return {
        ...query,
        data: mappedData, // Return the mapped data
        isLoading: query.isLoading || isLoadingMaster,
    };
};
