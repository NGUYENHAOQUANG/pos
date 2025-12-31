import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WarehouseMaterialList } from '../../components/warehouse/WarehouseMaterialList';
import { spacing } from '@/styles';
import { IWarehouseReceipt } from '../../types/material.types';

interface WarehouseListScreenProps {
    receipts: IWarehouseReceipt[];
}

export const WarehouseListScreen: React.FC<WarehouseListScreenProps> = ({ receipts }) => {
    return (
        <View style={styles.container}>
            <WarehouseMaterialList receipts={receipts} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
});
