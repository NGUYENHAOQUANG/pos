import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { WarehouseMaterialItem } from '@/features/material/components/warehouse/WarehouseMaterialItem';
import { MaterialItemSkeleton } from '@/features/material/components/material_list/MaterialListSkeleton';
import { colors } from '@/styles';
import { materialListStyles } from '@/features/material/styles/materialListStyles';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

interface WarehouseMaterialListProps {
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

export const WarehouseMaterialList: React.FC<WarehouseMaterialListProps> = ({
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
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    };

    if (isLoading) {
        return (
            <View style={materialListStyles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <MaterialItemSkeleton />}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={materialListStyles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    return (
        <View style={materialListStyles.container}>
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <WarehouseMaterialItem
                        item={item}
                        onHistoryPress={onHistoryPress}
                        onAdjustmentPress={onAdjustmentPress}
                        hideRemaining={hideRemaining}
                        alwaysExpanded={alwaysExpanded}
                        showStatus={showStatus}
                    />
                )}
                contentContainerStyle={[
                    materialListStyles.listContent,
                    materials.length === 0 && materialListStyles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={materialListStyles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
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
};
