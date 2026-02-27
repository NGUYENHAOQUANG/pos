import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { InventoryCard } from '@/features/material/components/inventory/InventoryCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { spacing, colors } from '@/styles';
import { useInfiniteInventoryTickets } from '@/features/material/hooks/inventory/useInventory';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const InventoryScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const inventoryStatusFilter = useMaterialStore(state => state.inventoryStatusFilter);
    const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

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

    const { isConnected } = useNetInfo();
    const showSkeleton =
        isWarehousesLoading || isLoading || (!!isConnected && isRefetching && !isFetchingNextPage);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (showSkeleton) {
        return (
            <View style={styles.containerLoading}>
                <MaterialLoadingState />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={inventoryList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <InventoryCard data={item} />}
                ListEmptyComponent={
                    <MaterialEmptyState
                        tab="inventory"
                        onPress={() => navigation.navigate('AddInventory', {})}
                    />
                }
                contentContainerStyle={[
                    styles.listContent,
                    inventoryList.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={refetch}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
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
    loaderFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
});
