import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Platform,
    UIManager,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { ExportReceipt } from '@/features/material/types/exportReceipt.types';
import { ExportWarehouseReceiptCard } from './ExportWarehouseReceiptCard';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';
import { spacing, colors } from '@/styles';

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

export const ExportWarehouseMaterialList: React.FC<ExportWarehouseMaterialListProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
    onPressCreate,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
}) => {
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    };

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
                renderItem={({ item }) => <ExportWarehouseReceiptCard item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContainer,
                    receipts.length === 0 && styles.emptyContent,
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
                        <View style={styles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <MaterialEmptyState tab="export" onPress={onPressCreate || (() => {})} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
