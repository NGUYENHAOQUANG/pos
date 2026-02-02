import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '@/features/material/components/warehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { IExportWarehouseReceipt } from '@/features/material/types/warehouse.types';

interface ExportWarehouseListScreenProps {
    receipts: IExportWarehouseReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export const ExportWarehouseListScreen: React.FC<ExportWarehouseListScreenProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
}) => {
    return (
        <View style={styles.container}>
            <ExportWarehouseMaterialList
                receipts={receipts}
                isLoading={isLoading}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
});
