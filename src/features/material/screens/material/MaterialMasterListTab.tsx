import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { MaterialListScreen } from '@/features/material/screens/material/MaterialListScreen';
import { IMaterial } from '@/features/material/types/material.types';
import { useMaterialStore } from '@/features/material/store';

interface MaterialMasterListTabProps {
    onPressCreate: () => void;
    onEdit: (item: IMaterial) => void;
    onHistoryPress?: (item: IMaterial) => void;
    onAdjustmentPress?: (item: IMaterial) => void;
}

export const MaterialMasterListTab: React.FC<MaterialMasterListTabProps> = ({ onPressCreate }) => {
    const filterType = useMaterialStore(state => state.filterType);
    const searchText = useMaterialStore(state => state.searchText);

    // Config params for API
    const params = useMemo(
        () => ({
            SearchText: searchText || undefined,
            MaterialTypeId: filterType || undefined,
            Page: 1,
            PageSize: 100, // Load enough items
        }),
        [searchText, filterType]
    );

    // Fetch materials
    const { data: materials = [], isLoading, refetch, isRefetching } = useMaterials(params);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <View style={styles.container}>
            <MaterialListScreen
                materials={materials}
                isLoading={isLoading}
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                onPressCreate={onPressCreate}
                hideRemaining={true}
                alwaysExpanded={true}
                showStatus={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
