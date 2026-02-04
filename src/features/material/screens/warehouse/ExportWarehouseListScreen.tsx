import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '@/features/material/components/exportwarehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { IExportWarehouseReceipt } from '@/features/material/types/warehouse.types';

interface ExportWarehouseListScreenProps {
    receipts: IExportWarehouseReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate?: () => void;
}

export const ExportWarehouseListScreen: React.FC<ExportWarehouseListScreenProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
    onPressCreate,
}) => {
    return (
        <View style={styles.container}>
            <ExportWarehouseMaterialList
                receipts={receipts}
                isLoading={isLoading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onPressCreate={onPressCreate}
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
