import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WarehouseMaterialList } from '@/features/material/components/warehouse/WarehouseMaterialList';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { IWarehouseItem } from '@/features/material/types/warehouse.types';

import { useWarehouses, useInfiniteWarehouseItems } from '@/features/material/hooks/useWarehouses';
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
    const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses({
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
        const params: any = {};

        if (searchText && searchText.trim()) {
            params.SearchText = searchText.trim();
        }

        if (filterGroup) {
            params.MaterialGroupId = filterGroup;
        }

        return params;
    }, [searchText, filterGroup]);

    // 3. Fetch Data
    const {
        data: materials = [],
        isLoading,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteWarehouseItems(warehouseId, materialParams, { enabled: !!warehouseId });

    const { isConnected } = useNetInfo();
    const showSkeleton =
        isWarehousesLoading || isLoading || (!!isConnected && isRefetching && !isFetchingNextPage);

    return (
        <View style={styles.container}>
            <WarehouseMaterialList
                materials={materials}
                isLoading={showSkeleton}
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={refetch}
                onLoadMore={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                onEdit={onEdit}
                onHistoryPress={onHistoryPress}
                onAdjustmentPress={handleAdjustmentPress}
                onPressCreate={onPressCreate}
                hideRemaining={hideRemaining}
                alwaysExpanded={alwaysExpanded}
                showStatus={showStatus}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
