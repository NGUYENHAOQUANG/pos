import { useMemo } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useInfiniteWarehouseItems, useWarehouses } from '@/features/material/hooks/useWarehouses';
import { IMaterial } from '@/features/material/types/material.types';
import {
    GetWarehouseItemsQueryParams,
    SpecificType,
} from '@/features/material/types/warehouse.types';

interface UseFilteredWarehouseMaterialsOptions {
    /** Filter by material group IDs */
    materialGroupIds?: string[];
    /** Filter by material type IDs */
    materialTypeIds?: string[];
    /** Search text */
    searchText?: string;
    /** Filter by specific type (Normal, ShrimpSeed, ShrimpFeed) */
    specificType?: SpecificType;
}

/**
 * Hook to fetch warehouse materials with API-level filtering.
 * Uses MaterialGroupIds / MaterialTypeIds to filter server-side.
 *
 * Different from useFarmMaterials which fetches all items and maps them client-side.
 */
export const useFilteredWarehouseMaterials = (options?: UseFilteredWarehouseMaterialsOptions) => {
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const defaultWarehouseId = warehouses?.[0]?.id;

    const queryParams = useMemo(() => {
        const params: Omit<GetWarehouseItemsQueryParams, 'Page' | 'PageSize'> = {};

        if (options?.materialGroupIds?.length) {
            params.MaterialGroupIds = options.materialGroupIds;
        }
        if (options?.materialTypeIds?.length) {
            params.MaterialTypeIds = options.materialTypeIds;
        }
        if (options?.searchText?.trim()) {
            params.SearchText = options.searchText.trim();
        }
        if (options?.specificType) {
            params.SpecificType = options.specificType;
        }

        return params;
    }, [
        options?.materialGroupIds,
        options?.materialTypeIds,
        options?.searchText,
        options?.specificType,
    ]);

    const {
        data: warehouseItems = [],
        isLoading: warehouseItemsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        total,
    } = useInfiniteWarehouseItems(defaultWarehouseId, queryParams, {
        enabled: !!defaultWarehouseId,
    });

    const materials: IMaterial[] = useMemo(() => {
        return warehouseItems.map(
            item =>
                ({
                    id: item.id,
                    materialDefId: item.materialId,
                    name: item.materialName || 'Vật tư',
                    group: '' as any,
                    groupId: item.materialGroupId,
                    unit: '',
                    unitName: item.unitName || '',
                    remaining: item.quantity || 0,
                    manufacturer: item.manufacturer,
                    price: item.averagePrice,
                } as IMaterial)
        );
    }, [warehouseItems]);

    const materialMap = useMemo(() => {
        return materials.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {} as Record<string, IMaterial>);
    }, [materials]);

    return {
        materials,
        materialMap,
        isLoading: warehouseItemsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        total,
    };
};
