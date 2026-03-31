import React from 'react';
import { ExportWarehouseListContent } from '@/features/material/screens/export_warehouse_list/ExportWarehouseListContent';
import { useInfiniteExportWarehouse, useMaterialListState } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const ExportWarehouseListScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const exportReceiptStatusFilter = useMaterialStore(state => state.exportReceiptStatusFilter);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Prepare Params
    const exportWarehouseParams = React.useMemo(() => {
        const params: Record<string, string | number> = {};

        if (searchText?.trim()) {
            params.Search = searchText.trim();
        }

        if (filterMaterialName) {
            params.MaterialName = filterMaterialName;
        }

        if (warehouseId) {
            params.WarehouseId = warehouseId;
        }

        if (exportReceiptStatusFilter) {
            params.Status = exportReceiptStatusFilter;
        }

        return params;
    }, [searchText, filterMaterialName, warehouseId, exportReceiptStatusFilter]);

    // 3. Fetch Data with Infinite Scroll
    const {
        data: receipts = [],
        refetch,
        isRefetching,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteExportWarehouse(exportWarehouseParams);

    const { showSkeleton, isRefreshing } = getListState({
        isLoading,
        isRefetching,
        isFetchingNextPage,
        itemsCount: receipts.length,
    });

    const handlePressCreate = React.useCallback(() => {
        navigation.navigate('ExportWarehouseForm', {});
    }, [navigation]);

    return (
        <ExportWarehouseListContent
            receipts={receipts}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetch}
            onPressCreate={handlePressCreate}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
        />
    );
};
