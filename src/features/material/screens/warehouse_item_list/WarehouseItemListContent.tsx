import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { WarehouseMaterialItem } from '@/features/material/components/warehouse/WarehouseMaterialItem';
import { MaterialItemSkeleton } from '@/features/material/components/material_list/MaterialListSkeleton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles';
import { StyleSheet } from 'react-native';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

interface WarehouseItemListContentProps {
    materials: IWarehouseItem[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onHistoryPress?: (item: IWarehouseItem) => void;
    onAdjustmentPress?: (item: IWarehouseItem) => void;
    onPressCreate?: () => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const WarehouseItemListContent: React.FC<WarehouseItemListContentProps> = React.memo(
    ({
        materials,
        isLoading,
        refreshing,
        onRefresh,
        onLoadMore,
        isFetchingNextPage,
        hasNextPage,
        onHistoryPress,
        onAdjustmentPress,
        onPressCreate,
        hideRemaining,
        alwaysExpanded,
        showStatus,
    }) => {
        const theme = useAppTheme();
        const styles = getStyles(theme);

        const handleLoadMore = React.useCallback(() => {
            if (hasNextPage && !isFetchingNextPage && onLoadMore) {
                onLoadMore();
            }
        }, [hasNextPage, isFetchingNextPage, onLoadMore]);

        const renderItem = React.useCallback(
            ({ item }: { item: IWarehouseItem }) => (
                <WarehouseMaterialItem
                    item={item}
                    onHistoryPress={onHistoryPress}
                    onAdjustmentPress={onAdjustmentPress}
                    hideRemaining={hideRemaining}
                    alwaysExpanded={alwaysExpanded}
                    showStatus={showStatus}
                />
            ),
            [onHistoryPress, onAdjustmentPress, hideRemaining, alwaysExpanded, showStatus]
        );

        const keyExtractor = React.useCallback((item: IWarehouseItem) => item.id, []);

        const renderSkeleton = React.useCallback(() => <MaterialItemSkeleton />, []);
        const skeletonKeyExtractor = React.useCallback((item: number) => item.toString(), []);

        if (isLoading) {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={[1, 2, 3, 4, 5]}
                        renderItem={renderSkeleton}
                        keyExtractor={skeletonKeyExtractor}
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
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
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
                                <ActivityIndicator color={theme.primary} />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyStateCard
                            message="Chưa có vật tư nào trong kho."
                            buttonTitle="Thêm vật tư vào kho"
                            onPress={onPressCreate || (() => {})}
                        />
                    }
                />
            </View>
        );
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        listContent: {
            paddingBottom: 100,
            flexGrow: 1,
        },
        emptyContent: {
            flex: 1,
        },
        loaderFooter: {
            paddingVertical: 16,
            alignItems: 'center',
        },
    });
