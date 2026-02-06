import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '@/features/material/components/exportwarehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { useExportWarehouse } from '@/features/material/hooks';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const ExportWarehouseListScreen: React.FC<{ onPressCreate?: () => void }> = ({
    onPressCreate,
}) => {
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { data: warehouses } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

    // 2. Prepare Params
    const exportWarehouseParams = React.useMemo(
        () => ({
            Search: searchText,
            MaterialName: filterMaterialName || undefined,
            WarehouseId: warehouseId || undefined,
            Status: importReceiptStatusFilter || undefined,
            Page: 1,
            PageSize: 20,
        }),
        [searchText, filterMaterialName, warehouseId, importReceiptStatusFilter]
    );

    // 3. Fetch Data
    const {
        data: exportWarehouseList,
        refetch,
        isRefetching,
        isLoading,
    } = useExportWarehouse(exportWarehouseParams);

    const receipts = exportWarehouseList?.items || [];

    return (
        <View style={styles.container}>
            <ExportWarehouseMaterialList
                receipts={receipts}
                isLoading={isLoading}
                refreshing={isRefetching}
                onRefresh={refetch}
                onPressCreate={onPressCreate}
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
