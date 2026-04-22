import React from 'react';

import { InventoryListContent } from '@/features/material/screens/inventory_list/InventoryListContent';
import {
    useInfiniteInventoryTickets,
    useMaterialListState,
    useApproveInventoryCheck,
    useRejectInventoryCheck,
} from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const InventoryListScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const inventoryStatusFilter = useMaterialStore(state => state.inventoryStatusFilter);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Prepare Params
    const inventoryParams = React.useMemo(() => {
        const params: Record<string, string | number> = {};

        if (searchText?.trim()) {
            params.SearchText = searchText.trim();
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

    const approveMutation = useApproveInventoryCheck();
    const rejectMutation = useRejectInventoryCheck();

    const { showSkeleton, isRefreshing } = getListState({
        isLoading,
        isRefetching,
        isFetchingNextPage,
        itemsCount: inventoryList.length,
    });

    const handlePressCreate = React.useCallback(() => {
        navigation.navigate('AddInventory', {});
    }, [navigation]);

    return (
        <InventoryListContent
            inventoryList={inventoryList}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetch}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onPressCreate={handlePressCreate}
            onApprove={(id, code) => approveMutation.mutate({ id, code })}
            onReject={(id, code) => rejectMutation.mutate({ id, code })}
        />
    );
};
