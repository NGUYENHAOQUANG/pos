import React from 'react';
import { View, StyleSheet, FlatList, Platform, UIManager, RefreshControl } from 'react-native';
import { ImportReceiptSkeleton } from '@/features/material/components/warehouse/ImportReceiptSkeleton';
import { IExportWarehouseReceipt } from '../../types/warehouse.types';
import { ExportWarehouseReceiptCard } from './ExportWarehouseReceiptCard';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface ExportWarehouseMaterialListProps {
    receipts: IExportWarehouseReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export const ExportWarehouseMaterialList: React.FC<ExportWarehouseMaterialListProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
}) => {
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

    return (
        <View style={styles.container}>
            <FlatList
                data={receipts}
                renderItem={({ item }) => <ExportWarehouseReceiptCard item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
                    ) : undefined
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
    },
});
