import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { BreedOption } from '@/features/farm/types/farm.types';

export const useBreedOptions = (
    effectiveZoneId: string | undefined,
    initialBreedSource: string | number | undefined,
    initialBreedName: string | undefined
) => {
    // 1. Fetch Warehouses filtered by the current Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });

    // 2. Fetch Shrimp Seeds from ALL warehouses
    const {
        data: shrimpSeeds,
        isLoading: isLoadingSeeds,
        refetch,
    } = useQuery({
        queryKey: ['shrimp-seeds-all-warehouses', warehouses],
        queryFn: async () => {
            if (!warehouses || warehouses.length === 0) return [];

            try {
                const promises = warehouses.map(w =>
                    warehouseApi
                        .getShrimpSeeds(w.id, { _t: Date.now() } as any)
                        .catch(() => ({ data: { items: [] } } as any))
                );

                const results = await Promise.all(promises);

                const allItems = results.reduce<IShrimpSeed[]>((acc, r: any) => {
                    if (r?.data?.items) {
                        return acc.concat(r.data.items);
                    }
                    return acc;
                }, []);

                const seen = new Set();
                return allItems.filter((item: IShrimpSeed) => {
                    const idStr = String(item.id);
                    if (seen.has(idStr)) return false;
                    seen.add(idStr);
                    return true;
                });
            } catch (error) {
                console.warn('Failed to fetch seeds from warehouses', error);
                return [];
            }
        },
        enabled: !!warehouses && warehouses.length > 0,
        refetchInterval: 5000,
    });

    // 3. Map shrimp seeds to breed options with fallback
    const options: BreedOption[] = useMemo(() => {
        let mappedOptions: BreedOption[] = [];

        if (shrimpSeeds && shrimpSeeds.length > 0) {
            mappedOptions = shrimpSeeds.map((seed: IShrimpSeed) => ({
                label: seed.materialName || 'N/A',
                value: seed.id,
                materialCode: seed.materialCode,
                price: seed.averagePrice || 0,
                supplier: seed.manufacturer || seed.supplier || 'N/A',
                remainingQuantity: seed.quantity ?? 0,
            }));
        }

        // --- Fallback for Edit Mode ---
        if (initialBreedSource) {
            const currentBreedId = String(initialBreedSource);
            const exists = mappedOptions.some(o => String(o.value) === currentBreedId);

            if (!exists) {
                mappedOptions = [
                    {
                        label: initialBreedName || 'Giống hiện tại',
                        value: String(initialBreedSource),
                        materialCode: '', // Unknown if not in list
                        price: 0, // Unknown
                        supplier: '',
                        remainingQuantity: 0,
                    },
                    ...mappedOptions,
                ];
            }
        }

        return mappedOptions;
    }, [shrimpSeeds, initialBreedSource, initialBreedName]);

    return {
        options,
        isLoading: isLoadingSeeds,
        refetch,
    };
};
