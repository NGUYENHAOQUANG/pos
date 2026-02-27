import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '@/features/material/components/exportwarehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { useInfiniteExportWarehouse } from '@/features/material/hooks';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNetInfo } from '@react-native-community/netinfo';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const ExportWarehouseListScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterMaterialName = useMaterialStore(state => state.filterMaterialName);
    const exportReceiptStatusFilter = useMaterialStore(state => state.exportReceiptStatusFilter);
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
                onPressCreate={() => navigation.navigate('ExportWarehouseForm', {})}
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
