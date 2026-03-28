import React from 'react';
import { View, FlatList } from 'react-native';
import { InventoryCard } from '@/features/material/components/inventory_list/InventoryCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { ListFooterLoader } from '@/shared/components/ui/ListFooterLoader';
import { materialListStyles } from '@/features/material/styles/materialListStyles';
import { IInventoryCheck } from '@/features/material/types/inventoryCheck.types';

interface InventoryMaterialListProps {
    inventoryList: IInventoryCheck[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onPressCreate?: () => void;
}

export const InventoryMaterialList: React.FC<InventoryMaterialListProps> = React.memo(
    ({
        inventoryList,
        isLoading,
        refreshing,
        onRefresh,
        onLoadMore,
        isFetchingNextPage,
        hasNextPage,
        onPressCreate,
    }) => {
        const handleLoadMore = React.useCallback(() => {
            if (hasNextPage && !isFetchingNextPage && onLoadMore) {
                onLoadMore();
            }
        }, [hasNextPage, isFetchingNextPage, onLoadMore]);

        const renderItem = React.useCallback(({ item }: { item: IInventoryCheck }) => {
            return <InventoryCard data={item} />;
        }, []);

        const keyExtractor = React.useCallback((item: IInventoryCheck) => item.id, []);

        if (isLoading) {
            return (
                <View style={materialListStyles.containerWithPadding}>
                    <MaterialLoadingState />
                </View>
            );
        }

        return (
            <View style={materialListStyles.container}>
                <FlatList
                    data={inventoryList}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <EmptyStateCard
                            message="Chưa có phiếu điều chỉnh tồn kho nào được tạo."
                            buttonTitle="Tạo Phiếu Điều Chỉnh Tồn Kho"
                            onPress={onPressCreate || (() => {})}
                        />
                    }
                    contentContainerStyle={[
                        materialListStyles.listContent,
                        inventoryList.length === 0 && materialListStyles.emptyContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingNextPage ? <ListFooterLoader /> : null}
                />
            </View>
        );
    }
);
