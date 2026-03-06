import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '@/styles';
import { materialListStyles } from '@/features/material/styles/materialListStyles';
import { ImportReceipt } from '@/features/material/types/importReceipt.types';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { ImportReceiptCard } from '@/features/material/components/import_receipt_list/ImportReceiptCard';

interface ImportReceiptMaterialListProps {
    receipts: ImportReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onPressCreate?: () => void;
}

export const ImportReceiptMaterialList: React.FC<ImportReceiptMaterialListProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
    onPressCreate,
}) => {
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    const renderItem = useCallback(({ item }: { item: ImportReceipt }) => {
        return <ImportReceiptCard item={item} />;
    }, []);

    const keyExtractor = useCallback((item: ImportReceipt) => item.id, []);

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
                        message="Chưa có phiếu nhập kho nào được tạo."
                        buttonTitle="Tạo phiếu nhập kho"
                        onPress={onPressCreate || (() => {})}
                    />
                }
            />
        </View>
    );
};
