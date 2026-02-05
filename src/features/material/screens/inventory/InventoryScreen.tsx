import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { InventoryCard } from '@/features/material/components/inventory/InventoryCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { spacing } from '@/styles';
import { useInventoryTickets } from '@/features/material/hooks';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const InventoryScreen: React.FC<{ onPressCreate: () => void }> = ({ onPressCreate }) => {
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { data: warehouses } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

    // 2. Prepare Params
    const inventoryParams = React.useMemo(
        () => ({
            Search: searchText,
            WarehouseId: warehouseId,
            Status: importReceiptStatusFilter || undefined,
        }),
        [searchText, warehouseId, importReceiptStatusFilter]
    );

    // 3. Fetch Data
    const {
        data: inventoryList,
        refetch,
        isLoading,
        isRefetching,
    } = useInventoryTickets(inventoryParams);

    if (isLoading) {
        return (
            <View style={styles.containerLoading}>
                <MaterialLoadingState />
            </View>
        );
    }

    const data = inventoryList || [];

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <InventoryCard data={item} />}
                ListEmptyComponent={<MaterialEmptyState tab="inventory" onPress={onPressCreate} />}
                contentContainerStyle={[
                    styles.listContent,
                    (!data || data.length === 0) && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={isRefetching}
                onRefresh={refetch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    containerLoading: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
    },
    emptyContent: {
        flex: 1,
    },
});
