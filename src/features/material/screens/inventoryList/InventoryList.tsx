import React from 'react';

import { InventoryMaterialList } from '@/features/material/components/inventoryList/InventoryMaterialList';
import { useInfiniteInventoryTickets } from '@/features/material/hooks/inventory/useInventory';
import { useMaterialStore } from '@/features/material/store';
import { useMaterialListState } from '@/features/material/hooks/useMaterialListState';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const InventoryScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const inventoryStatusFilter = useMaterialStore(state => state.inventoryStatusFilter);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Prepare Params
    const inventoryParams = React.useMemo(() => {
        const params: any = {};

        if (searchText?.trim()) {
            params.Search = searchText.trim();
        }

        if (warehouseId) {
            params.WarehouseId = warehouseId;
        }

        if (inventoryStatusFilter) {
            params.Status = inventoryStatusFilter;
        }

        return params;
    }, [searchText, warehouseId, inventoryStatusFilter]);

    // 3. Fetch Data with Infinite Scroll
    const {
        data: inventoryList = [],
        refetch,
        isLoading,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteInventoryTickets(inventoryParams);

    const { showSkeleton, isRefreshing } = getListState({
        isLoading,
        isRefetching,
        isFetchingNextPage,
        itemsCount: inventoryList.length,
    });

    return (
        <InventoryMaterialList
            inventoryList={inventoryList}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetch}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onPressCreate={() => navigation.navigate('AddInventory', {})}
        />
    );
};
