import React from 'react';
import { View, StyleSheet, FlatList, Platform, UIManager, RefreshControl } from 'react-native';
import { IExportWarehouseReceipt } from '../../types/warehouse.types';
import { ExportWarehouseReceiptCard } from './ExportWarehouseReceiptCard';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { MaterialLoadingState } from '@/features/material/components/MaterialLoadingState';

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
    onPressCreate?: () => void;
}

export const ExportWarehouseMaterialList: React.FC<ExportWarehouseMaterialListProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
    onPressCreate,
}) => {
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
});
