import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { WarehouseMaterialItem } from '@/features/material/components/warehouse/WarehouseMaterialItem';
import { MaterialItemSkeleton } from '@/features/material/components/material/MaterialListSkeleton';
import { spacing, colors } from '@/styles';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';

interface WarehouseMaterialListProps {
    materials: IWarehouseItem[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onEdit?: (item: IWarehouseItem) => void;
    onHistoryPress?: (item: IWarehouseItem) => void;
    onAdjustmentPress?: (item: IWarehouseItem) => void;
    onPressCreate?: () => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const WarehouseMaterialList: React.FC<WarehouseMaterialListProps> = ({
    materials,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
    onPressCreate,
    hideRemaining,
    alwaysExpanded,
    showStatus,
}) => {
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <MaterialItemSkeleton />}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <WarehouseMaterialItem
                        item={item}
                        onEdit={onEdit}
                        onHistoryPress={onHistoryPress}
                        onAdjustmentPress={onAdjustmentPress}
                        hideRemaining={hideRemaining}
                        alwaysExpanded={alwaysExpanded}
                        showStatus={showStatus}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    materials.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <MaterialEmptyState tab="list" onPress={onPressCreate || (() => {})} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContent: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.xl,
        flexGrow: 1,
    },
    loaderFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
});
