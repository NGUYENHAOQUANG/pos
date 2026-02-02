import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { InventoryCard } from '@/features/material/components/inventory/InventoryCard';
import { ImportReceiptSkeleton } from '@/features/material/components/warehouse/ImportReceiptSkeleton';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { spacing } from '@/styles';
import { IInventoryTicket } from '@/features/material/types/inventoryTicket.types';

interface InventoryScreenProps {
    data: IInventoryTicket[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
    data,
    isLoading = false,
    refreshing,
    onRefresh,
    onPressCreate,
}) => {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <ImportReceiptSkeleton />}
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
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <InventoryCard data={item} />}
                ListEmptyComponent={<MaterialEmptyState tab="inventory" onPress={onPressCreate} />}
                contentContainerStyle={[
                    styles.listContent,
                    (!data || data.length === 0) && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing['3xl'],
        flexGrow: 1, // Ensure RefreshControl works even with empty list
    },
    emptyContent: {
        flex: 1,
    },
});
