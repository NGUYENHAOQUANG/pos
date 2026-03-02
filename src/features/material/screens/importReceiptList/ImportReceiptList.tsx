import React, { useCallback, useMemo } from 'react';
import { ImportReceiptMaterialList } from '@/features/material/components/importReceiptList/ImportReceiptMaterialList';
import { useInfiniteImportReceipts } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useMaterialListState } from '@/features/material/hooks/useMaterialListState';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const ImportReceiptList: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Prepare Params
    const warehouseParams = useMemo(
        () => ({
            ReceiptCode: searchText || undefined,
            WarehouseId: warehouseId || undefined,
            Status: importReceiptStatusFilter || undefined,
        }),
        [searchText, warehouseId, importReceiptStatusFilter]
    );

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
