import React, { useCallback } from 'react';
import { WarehouseMaterialList } from '@/features/material/components/warehouse/WarehouseMaterialList';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { IWarehouseItem } from '@/features/material/types/warehouse.types';

import { useInfiniteWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { useMaterialStore } from '@/features/material/store';
import { useMaterialListState } from '@/features/material/hooks/useMaterialListState';

interface WarehouseItemListScreenProps {
    onHistoryPress?: (item: IWarehouseItem) => void;
    onPressCreate?: () => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const WarehouseItemListScreen: React.FC<WarehouseItemListScreenProps> = ({
    onHistoryPress,
    onPressCreate,
    hideRemaining,
    alwaysExpanded,
    showStatus,
}) => {
    // 1. Get Filters from Store
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const searchText = useMaterialStore(state => state.searchText);
    const filterGroup = useMaterialStore(state => state.filterGroup);
    const { warehouseId, getListState } = useMaterialListState();

    // 2. Navigation Handlers
    const handleAdjustmentPress = useCallback(
        (item: IWarehouseItem) => {
            navigation.navigate('AddInventory', {
                initialMaterial: item,
            });
        },
        [navigation]
    );

    // 3. Prepare Params
    const materialParams = React.useMemo(() => {
        const params: any = {};

        if (searchText && searchText.trim()) {
            params.SearchText = searchText.trim();
        }

        if (filterGroup) {
            params.MaterialGroupIds = [filterGroup];
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

    const { showSkeleton, isRefreshing } = getListState({
        isLoading,
        isRefetching,
        isFetchingNextPage,
        itemsCount: materials.length,
    });

    return (
        <WarehouseMaterialList
            materials={materials}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetch}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onHistoryPress={onHistoryPress}
            onAdjustmentPress={handleAdjustmentPress}
            onPressCreate={onPressCreate}
            hideRemaining={hideRemaining}
            alwaysExpanded={alwaysExpanded}
            showStatus={showStatus}
        />
    );
};
