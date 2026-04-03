import React from 'react';
import { MaterialListContent } from '@/features/material/screens/material_list/MaterialListContent';
import { useInfiniteMaterials, useMaterialListState } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const MaterialListScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const currentWarehouseId = useFarmStore(state => state.currentWarehouseId);

    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterType = useMaterialStore(state => state.filterType);
    const { getListState } = useMaterialListState();

    // 2. Prepare Params
    const masterListParams = React.useMemo(
        () => ({
            WarehouseId: currentWarehouseId || undefined,
            SearchText: searchText || undefined,
            MaterialTypeId: filterType || undefined,
        }),
        [currentWarehouseId, searchText, filterType]
    );

    // 3. Fetch Data with Infinite Scroll
    const {
        data: masterMaterials = [],
        isLoading: isLoadingMasterMaterials,
        refetch: refetchMasterMaterials,
        isRefetching: isRefetchingMasterMaterials,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteMaterials(masterListParams);

    const { showSkeleton, isRefreshing } = getListState({
        isLoading: isLoadingMasterMaterials,
        isRefetching: isRefetchingMasterMaterials,
        isFetchingNextPage,
        itemsCount: masterMaterials.length,
    });

    const handlePressCreate = React.useCallback(() => {
        navigation.navigate('MaterialForm', {});
    }, [navigation]);

    return (
        <MaterialListContent
            materials={masterMaterials}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetchMasterMaterials}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onPressCreate={handlePressCreate}
        />
    );
};
