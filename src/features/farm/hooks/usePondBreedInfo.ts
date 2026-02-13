import { useQuery } from '@tanstack/react-query';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useCallback } from 'react';

export const usePondBreedInfo = (zoneId?: string) => {
    // 1. Fetch Warehouses for this Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: zoneId,
    });

    // 2. Fetch Shrimp Seeds from ALL warehouses
    const { data: shrimpSeeds } = useQuery({
        queryKey: ['shrimp-seeds-all-warehouses-shrimp-pond', zoneId, warehouses?.length],
        queryFn: async () => {
            if (!warehouses || warehouses.length === 0) {
                return [];
            }

            try {
                // Fetch seeds from all warehouses
                const promises = warehouses.map(w =>
                    warehouseApi.getShrimpSeeds(w.id).catch(() => ({ data: { items: [] } } as any))
                );

                const results = await Promise.all(promises);

                // Flatten results
                const allItems = results.reduce<IShrimpSeed[]>((acc, r: any) => {
                    if (r?.data?.items) {
                        return acc.concat(r.data.items);
                    }
                    // Handle case where r might be the data directly (depending on catch block return or API client behavior)
                    if (r?.items) {
                        return acc.concat(r.items);
                    }
                    return acc;
                }, []);

                // Deduplicate by ID
                const seen = new Set();
                const uniqueItems = allItems.filter(item => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });

                return uniqueItems;
            } catch (error) {
                console.warn('Failed to fetch seeds from warehouses', error);
                return [];
            }
        },
        enabled: !!warehouses && warehouses.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const breedOptions = useFarmStore(state => state.breedOptions);

    // Helper to get breed label
    const getBreedLabel = useCallback(
        (breedId?: string, breedName?: string) => {
            if (!breedId) return undefined;

            // 1. Prefer saved name if available
            if (breedName) return breedName;

            // 2. Try dynamic API data
            if (shrimpSeeds?.length) {
                const seed = shrimpSeeds.find(s => s.id === breedId);
                if (seed?.materialName) {
                    return seed.materialName;
                }
            }
            // 3. Fallback to static/store options
            const fallback = breedOptions.find(b => b.value === breedId)?.label;
            return fallback;
        },
        [shrimpSeeds, breedOptions]
    );

    return {
        shrimpSeeds,
        getBreedLabel,
    };
};
