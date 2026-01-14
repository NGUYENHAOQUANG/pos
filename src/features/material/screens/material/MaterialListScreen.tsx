import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { MaterialList } from '@/features/material/components/material/MaterialList';
import { spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';

interface MaterialListScreenProps {
    materials: IMaterial[];
    onEdit: (item: IMaterial) => void;
    onHistoryPress?: (item: IMaterial) => void;
    onAdjustmentPress?: (item: IMaterial) => void;
}

export const MaterialListScreen: React.FC<MaterialListScreenProps> = ({
    materials,
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
}) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MaterialList
                        item={item}
                        onEdit={onEdit}
                        onHistoryPress={onHistoryPress}
                        onAdjustmentPress={onAdjustmentPress}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
});
