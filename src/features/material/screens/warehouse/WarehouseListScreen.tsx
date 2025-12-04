import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WarehouseMaterialList } from '../../components/warehouse/WarehouseMaterialList';

interface WarehouseListScreenProps {
    receipts: any[];
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
    },
});
