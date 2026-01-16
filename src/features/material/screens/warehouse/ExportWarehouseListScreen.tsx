import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExportWarehouseMaterialList } from '../../components/warehouse/ExportWarehouseMaterialList';
import { spacing } from '@/styles';
import { IExportWarehouseReceipt } from '../../types/material.types';

interface ExportWarehouseListScreenProps {
    receipts: IExportWarehouseReceipt[];
}

export const ExportWarehouseListScreen: React.FC<ExportWarehouseListScreenProps> = ({
    receipts,
}) => {
    return (
        <View style={styles.container}>
            <ExportWarehouseMaterialList receipts={receipts} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
});
