import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { spacing, colors } from '@/styles';
import { ImportReceipt } from '@/features/material/types/importReceipt.types';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { ImportReceiptCard } from '../../components/importReceipt/ImportReceiptCard';
import { useInfiniteImportReceipts } from '@/features/material/hooks';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const ImportReceiptList: React.FC<{ onPressCreate?: () => void }> = ({ onPressCreate }) => {
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const importReceiptStatusFilter = useMaterialStore(state => state.importReceiptStatusFilter);
    const { data: warehouses } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

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

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderItem = useCallback(({ item }: { item: ImportReceipt }) => {
        return <ImportReceiptCard item={item} />;
    }, []);

    const keyExtractor = useCallback((item: ImportReceipt) => item.id, []);

    const handleEmptyPress = useCallback(() => {
        if (onPressCreate) {
            onPressCreate();
        }
    }, [onPressCreate]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <MaterialLoadingState />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={receipts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                    styles.listContainer,
                    receipts.length === 0 && styles.emptyContent,
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
                ListEmptyComponent={<MaterialEmptyState tab="history" onPress={handleEmptyPress} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    listContainer: {
        paddingBottom: 100,
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
