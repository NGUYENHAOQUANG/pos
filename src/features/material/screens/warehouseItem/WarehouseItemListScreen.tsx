import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { WarehouseMaterialItem } from '../../components/warehouse/WarehouseMaterialItem';
import { MaterialItemSkeleton } from '@/features/material/components/material/MaterialListSkeleton';
import { spacing } from '@/styles';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { IWarehouseItem } from '@/features/material/types/warehouse.types';

import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNetInfo } from '@react-native-community/netinfo';
import { useCallback } from 'react';

interface WarehouseItemListScreenProps {
    onEdit?: (item: IWarehouseItem) => void;
    onHistoryPress?: (item: IWarehouseItem) => void;
    onAdjustmentPress?: (item: IWarehouseItem) => void;
    onPressCreate?: () => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const WarehouseItemListScreen: React.FC<WarehouseItemListScreenProps> = ({
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
    onPressCreate,
    hideRemaining,
    alwaysExpanded,
    showStatus,
}) => {
    // 1. Get Filters from Store
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const searchText = useMaterialStore(state => state.searchText);
    const filterGroup = useMaterialStore(state => state.filterGroup);
    const { data: warehouses } = useWarehouses({
        ZoneId: useFarmStore(state => state.selectedZoneId) || undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

    // 2. Navigation Handlers
    const handleAdjustmentPress = useCallback(
        (item: IWarehouseItem) => {
            if (onAdjustmentPress) {
                onAdjustmentPress(item);
            } else {
                navigation.navigate('AddInventory', {
                    initialMaterial: item,
                });
            }
        },
        [onAdjustmentPress, navigation]
    );

    // 3. Prepare Params
    const materialParams = React.useMemo(() => {
        const params: any = {
            Page: 1,
            PageSize: 20,
        };

        if (searchText && searchText.trim()) {
            params.Search = searchText.trim();
        }

        if (filterGroup) {
            params.MaterialGroupId = filterGroup;
        }

        return params;
    }, [searchText, filterGroup]);

    // 3. Fetch Data
    const {
        data: warehouseItemsData,
        isLoading,
        refetch,
        isRefetching,
    } = useWarehouseItems(warehouseId, materialParams, { enabled: !!warehouseId });

    const materials = warehouseItemsData?.items || [];
    const { isConnected } = useNetInfo();
    const showSkeleton = isLoading || (!!isConnected && isRefetching);

    if (showSkeleton) {
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
                    <WarehouseMaterialItem
                        item={item}
                        onEdit={onEdit}
                        onHistoryPress={onHistoryPress}
                        onAdjustmentPress={handleAdjustmentPress}
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
                refreshing={isRefetching}
                onRefresh={refetch}
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
