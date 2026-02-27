import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '@/features/material/components/exportwarehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { useInfiniteExportWarehouse } from '@/features/material/hooks';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNetInfo } from '@react-native-community/netinfo';

export const ExportWarehouseListScreen: React.FC<{ onPressCreate?: () => void }> = ({
    onPressCreate,
}) => {
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

    // 2. Prepare Params
    const exportWarehouseParams = React.useMemo(() => {
        const params: any = {};

        if (searchText?.trim()) {
            params.Search = searchText.trim();
        }

        if (filterMaterialName) {
            params.MaterialName = filterMaterialName;
        }

        if (warehouseId) {
            params.WarehouseId = warehouseId;
        }

        if (importReceiptStatusFilter) {
            params.Status = importReceiptStatusFilter;
        }

        return params;
    }, [searchText, filterMaterialName, warehouseId, importReceiptStatusFilter]);

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

    const { isConnected } = useNetInfo();
    const showSkeleton =
        isWarehousesLoading || isLoading || (!!isConnected && isRefetching && !isFetchingNextPage);

    return (
        <View style={styles.container}>
            <ExportWarehouseMaterialList
                receipts={receipts}
                isLoading={showSkeleton}
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={refetch}
                onPressCreate={onPressCreate}
                onLoadMore={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
});
