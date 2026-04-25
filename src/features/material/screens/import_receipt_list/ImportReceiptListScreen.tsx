import React, { useCallback, useMemo } from 'react';
import { ImportReceiptMaterialList } from '@/features/material/screens/import_receipt_list/ImportReceiptListContent';
import { useInfiniteImportReceipts, useMaterialListState } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const ImportReceiptListScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Prepare Params
    const warehouseParams = useMemo(() => {
        const params: Record<string, string | number> = {};

        if (searchText?.trim()) {
            params.SearchText = searchText.trim();
        }

        if (warehouseId) {
            params.WarehouseId = warehouseId;
        }

        if (importReceiptStatusFilter) {
            params.Status = importReceiptStatusFilter;
        }

        return params;
    }, [searchText, warehouseId, importReceiptStatusFilter]);

    // 3. Fetch Data
    const {
        data: receipts = [],
        refetch,
        isRefetching,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteImportReceipts(warehouseParams);

    const { showSkeleton, isRefreshing } = getListState({
        isLoading,
        isRefetching,
        isFetchingNextPage,
        itemsCount: receipts.length,
    });

    const handleEmptyPress = useCallback(() => {
        navigation.navigate('ImportReceiptFormScreen', {});
    }, [navigation]);

    return (
        <ImportReceiptMaterialList
            receipts={receipts}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetch}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onPressCreate={handleEmptyPress}
        />
    );
};
