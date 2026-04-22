import React from 'react';
import { View, FlatList } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { ExportReceipt } from '@/features/material/types/exportReceipt.types';
import { ExportWarehouseReceiptCard } from '../../components/export_warehouse_list/ExportWarehouseReceiptCard';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { ListFooterLoader } from '@/shared/components/ui/ListFooterLoader';
import { getMaterialListStyles } from '@/features/material/styles/materialListStyles';
import { useAppTheme } from '@/styles/themeContext';

interface ExportWarehouseMaterialListProps {
    receipts: ExportReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onApprove?: (id: string, code: string) => void;
    onReject?: (id: string, code: string) => void;
}

export const ExportWarehouseListContent: React.FC<ExportWarehouseMaterialListProps> = React.memo(
    ({
        receipts,
        isLoading,
        refreshing,
        onRefresh,
        onPressCreate,
        onLoadMore,
        isFetchingNextPage,
        hasNextPage,
        onApprove,
        onReject,
    }) => {
        const theme = useAppTheme();
        const materialListStyles = getMaterialListStyles(theme);

        const handleLoadMore = React.useCallback(() => {
            if (hasNextPage && !isFetchingNextPage && onLoadMore) {
                onLoadMore();
            }
        }, [hasNextPage, isFetchingNextPage, onLoadMore]);

        const renderItem = React.useCallback(
            ({ item }: { item: ExportReceipt }) => {
                return (
                    <ExportWarehouseReceiptCard
                        item={item}
                        onApprove={onApprove}
                        onReject={onReject}
                    />
                );
            },
            [onApprove, onReject]
        );

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
                    ListFooterComponent={isFetchingNextPage ? <ListFooterLoader /> : null}
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
