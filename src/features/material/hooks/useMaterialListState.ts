import { useCallback } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';

interface ListStateParams {
    isLoading: boolean;
    isRefetching: boolean;
    isFetchingNextPage: boolean;
    itemsCount?: number;
}

/**
 * A shared hook to encapsulate common states for all material and warehouse lists:
 * 1. Automatically resolves `warehouseId` based on current Farm/Zone.
 * 2. Provides `getListState` to standardizes calculation for `showSkeleton` and `isRefreshing`.
 */
export const useMaterialListState = () => {
    const { isConnected } = useNetInfo();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses({
        ZoneId: selectedZoneId || undefined,
    });

    const warehouseId = warehouses?.[0]?.id;

    const getListState = useCallback(
        ({ isLoading, isRefetching, isFetchingNextPage }: ListStateParams) => {
            const showSkeleton = Boolean(
                isWarehousesLoading ||
                    isLoading ||
                    (!!isConnected && isRefetching && !isFetchingNextPage)
            );

            const isRefreshing = isRefetching && !isFetchingNextPage;

            return { showSkeleton, isRefreshing };
        },
        [isWarehousesLoading, isConnected]
    );

    return {
        warehouseId,
        getListState,
    };
};
