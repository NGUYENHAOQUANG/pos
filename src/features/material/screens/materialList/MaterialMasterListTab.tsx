import React from 'react';
import { MaterialMasterList } from '@/features/material/components/materialForm/MaterialMasterList';
import { useInfiniteMaterials } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useMaterialListState } from '@/features/material/hooks/useMaterialListState';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const MaterialMasterListTab: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterType = useMaterialStore(state => state.filterType);
    const { getListState } = useMaterialListState();

    // 2. Prepare Params
    const masterListParams = React.useMemo(
        () => ({
            SearchText: searchText || undefined,
            MaterialTypeId: filterType || undefined,
        }),
        [searchText, filterType]
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

    return (
        <MaterialMasterList
            materials={masterMaterials}
            isLoading={showSkeleton}
            refreshing={isRefreshing}
            onRefresh={refetchMasterMaterials}
            onLoadMore={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onPressCreate={() => navigation.navigate('MaterialForm', {})}
        />
    );
};
