import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { spacing } from '@/styles';
import { ImportReceiptSkeleton } from '@/features/material/components/importReceipt/ImportReceiptSkeleton';
import { ImportReceipt } from '@/features/material/types/importReceipt.types';
import { IPaginate } from '@/shared/types/common.types';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { ImportReceiptCard } from './ImportReceiptCard';

interface ImportReceiptListProps {
    data: IPaginate<ImportReceipt> | undefined;
    onEndReached?: () => void;
    refreshing?: boolean;
    onRefresh?: () => void;
    isLoading?: boolean;
    onPressCreate?: () => void;
}

export const ImportReceiptList: React.FC<ImportReceiptListProps> = ({
    data,
    onEndReached,
    refreshing,
    onRefresh,
    isLoading,
    onPressCreate,
}) => {
    const receipts = data?.items || [];

    if (isLoading) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <ImportReceiptSkeleton />}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    const renderItem = ({ item }: { item: ImportReceipt }) => {
        return <ImportReceiptCard item={item} />;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={receipts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContainer,
                    receipts.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <MaterialEmptyState tab="history" onPress={onPressCreate || (() => {})} />
                }
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
});
