import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { MaterialList } from '@/features/material/components/material/MaterialList';
import { MaterialItemSkeleton } from '@/features/material/components/material/MaterialListSkeleton';
import { spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';

import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';

interface MaterialListScreenProps {
    materials: IMaterial[];
    onEdit?: (item: IMaterial) => void;
    onHistoryPress?: (item: IMaterial) => void;
    onAdjustmentPress?: (item: IMaterial) => void;
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onPressCreate?: () => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const MaterialListScreen: React.FC<MaterialListScreenProps> = ({
    materials,
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
    isLoading = false,
    refreshing,
    onRefresh,
    onPressCreate,
    hideRemaining,
    alwaysExpanded,
    showStatus,
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
                    <MaterialList
                        item={item}
                        onEdit={onEdit}
                        onHistoryPress={onHistoryPress}
                        onAdjustmentPress={onAdjustmentPress}
                        hideRemaining={hideRemaining}
                        alwaysExpanded={alwaysExpanded}
                        showStatus={showStatus}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    materials.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <MaterialEmptyState tab="list" onPress={onPressCreate || (() => {})} />
                }
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
