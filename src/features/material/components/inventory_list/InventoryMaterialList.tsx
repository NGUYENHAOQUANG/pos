import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { InventoryCard } from '@/features/material/components/inventory_list/InventoryCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { colors } from '@/styles';
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

export const InventoryMaterialList: React.FC<InventoryMaterialListProps> = ({
    inventoryList,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
    onPressCreate,
}) => {
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    };

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
                keyExtractor={item => item.id}
                renderItem={({ item }) => <InventoryCard data={item} />}
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
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={materialListStyles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};
