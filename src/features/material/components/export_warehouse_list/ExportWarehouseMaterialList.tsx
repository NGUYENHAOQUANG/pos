import React from 'react';
import {
    View,
    FlatList,
    Platform,
    UIManager,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { ExportReceipt } from '@/features/material/types/exportReceipt.types';
import { ExportWarehouseReceiptCard } from './ExportWarehouseReceiptCard';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { colors } from '@/styles';
import { materialListStyles } from '@/features/material/styles/materialListStyles';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface ExportWarehouseMaterialListProps {
    receipts: ExportReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
}

export const ExportWarehouseMaterialList: React.FC<ExportWarehouseMaterialListProps> = React.memo(
    ({
        receipts,
        isLoading,
        refreshing,
        onRefresh,
        onPressCreate,
        onLoadMore,
        isFetchingNextPage,
        hasNextPage,
    }) => {
        const handleLoadMore = React.useCallback(() => {
            if (hasNextPage && !isFetchingNextPage && onLoadMore) {
                onLoadMore();
            }
        }, [hasNextPage, isFetchingNextPage, onLoadMore]);

        const renderItem = React.useCallback(({ item }: { item: ExportReceipt }) => {
            return <ExportWarehouseReceiptCard item={item} />;
        }, []);

        const keyExtractor = React.useCallback((item: ExportReceipt) => item.id, []);

        if (isLoading) {
            return (
                <View style={materialListStyles.containerWithPadding}>
                    <MaterialLoadingState />
                </View>
            );
        }

        return (
            <View style={materialListStyles.containerWithPadding}>
                <FlatList
                    data={receipts}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={[
                        materialListStyles.listContent,
                        receipts.length === 0 && materialListStyles.emptyContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
                        ) : undefined
                    }
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
                            message="Chưa có phiếu xuất kho nào được tạo."
                            buttonTitle="Tạo phiếu xuất kho"
                            onPress={onPressCreate || (() => {})}
                        />
                    }
                />
            </View>
        );
    }
);
