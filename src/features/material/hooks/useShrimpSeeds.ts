import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { GetWarehousesParams, IShrimpSeed } from '@/features/material/types/warehouse.types';
import { useCycleDetail } from '@/features/farm/hooks/useCycle';

export const useShrimpSeeds = (warehouseId?: string, params?: GetWarehousesParams) => {
    return useQuery({
        queryKey: ['shrimp-seeds', warehouseId, params],
        queryFn: async () => {
            if (!warehouseId) return [];
            const response = await warehouseApi.getShrimpSeeds(warehouseId, params);
            return response?.data?.items || [];
        },
        enabled: !!warehouseId,
    });
};

export const useCurrentShrimpBreed = (pondId: string, cycleId: string, warehouseId: string) => {
    const { data: cycleDetailResponse } = useCycleDetail(pondId, cycleId);
    const cycleData = cycleDetailResponse?.data ?? null;
    const warehouseItemId = cycleData?.warehouseItemId;

    const { data: shrimpSeeds } = useShrimpSeeds(warehouseId);

    const currentShrimpSeed = useMemo((): IShrimpSeed | undefined => {
        if (!warehouseItemId || !shrimpSeeds) return undefined;
        return shrimpSeeds.find((s: IShrimpSeed) => s.id === warehouseItemId);
    }, [warehouseItemId, shrimpSeeds]);

    const breedName = currentShrimpSeed?.materialName || 'N/A';

    return {
        breedName,
        currentShrimpSeed,
        cycleData,
    };
};
