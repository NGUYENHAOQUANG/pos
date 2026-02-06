import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialMasterItem } from '../../components/inventory/MaterialMasterItem';
import { MaterialItemSkeleton } from '@/features/material/components/material/MaterialListSkeleton';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { spacing, colors } from '@/styles';
import { useInfiniteMaterials } from '@/features/material/hooks';
import { useMaterialStore } from '@/features/material/store';
import { useNetInfo } from '@react-native-community/netinfo';

export const MaterialMasterListTab: React.FC<{
    onPressCreate: () => void;
}> = ({ onPressCreate }) => {
    // 1. Get Filters from Store
    const searchText = useMaterialStore(state => state.searchText);
    const filterType = useMaterialStore(state => state.filterType);

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

    const { isConnected } = useNetInfo();
    const showSkeleton =
        isLoadingMasterMaterials ||
        (!!isConnected &&
            isRefetchingMasterMaterials &&
            !isFetchingNextPage &&
            masterMaterials.length === 0);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

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
                data={masterMaterials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MaterialMasterItem
                        item={item}
                        hideRemaining={true}
                        alwaysExpanded={true}
                        showStatus={true}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    masterMaterials.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={isRefetchingMasterMaterials && !isFetchingNextPage}
                onRefresh={refetchMasterMaterials}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
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
    loaderFooter: {
        padding: spacing.md,
        alignItems: 'center',
    },
});
