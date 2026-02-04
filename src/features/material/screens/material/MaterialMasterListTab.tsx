import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IMaterial } from '@/features/material/types/material.types';
import { FlatList } from 'react-native';
import { MaterialMasterItem } from '../../components/inventory/MaterialMasterItem';
import { MaterialItemSkeleton } from '@/features/material/components/material/MaterialListSkeleton';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { spacing } from '@/styles';

interface MaterialMasterListTabProps {
    materials: IMaterial[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate: () => void;
    onEdit?: (item: IMaterial) => void;
}

export const MaterialMasterListTab: React.FC<MaterialMasterListTabProps> = ({
    materials,
    isLoading,
    refreshing,
    onRefresh,
    onPressCreate,
    onEdit,
}) => {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <MaterialItemSkeleton />}
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
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MaterialMasterItem
                        item={item}
                        onEdit={onEdit}
                        hideRemaining={true}
                        alwaysExpanded={true}
                        showStatus={true}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    materials.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={<MaterialEmptyState tab="material" onPress={onPressCreate} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContent: {
        flex: 1,
    },
    listContent: {
        paddingBottom: spacing.xl,
        flexGrow: 1,
    },
});
