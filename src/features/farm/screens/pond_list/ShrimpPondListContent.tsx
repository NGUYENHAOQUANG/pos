import React, { useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond-list/ShrimpPondList';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { PondListSkeleton } from '@/features/farm/components/skeleton/PondListSkeleton';
import { PondData } from '@/features/farm/types/farm.types';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

export interface ShrimpPondListContentProps {
    farmOptions: DropDownItem[];
    selectedFarm: DropDownItem | undefined;
    selectedZoneId: string | undefined;
    selectedTab: string;
    onTabSelect: (tab: string) => void;
    counts: { all: number; active: number; preparing: number };
    filteredData: PondData[];
    showSkeleton: boolean;
    isRefetching: boolean;
    isFetchingNextPage: boolean;
    onSelectFarm: (item: DropDownItem) => void;
    onFarmInfoPress: () => void;
    onPondPress: (pond: PondData) => void;
    onPondInfoPress: (pond: PondData) => void;
    onLoadMore: () => void;
    onRefresh: () => void;
    warehouseId?: string;
}

export const ShrimpPondListContent: React.FC<ShrimpPondListContentProps> = ({
    farmOptions,
    selectedFarm,
    selectedZoneId,
    selectedTab,
    onTabSelect,
    counts,
    filteredData,
    showSkeleton,
    isRefetching,
    isFetchingNextPage,
    onSelectFarm,
    onFarmInfoPress,
    onPondPress,
    onPondInfoPress,
    onLoadMore,
    onRefresh,
    warehouseId,
}) => {
    const flatListRef = useRef<FlatList<PondData>>(null);
    useScrollToTop(flatListRef as any);

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loaderFooter}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="list"
                data={farmOptions}
                value={selectedFarm}
                onSelect={onSelectFarm}
                onMenuPress={onFarmInfoPress}
            />
            <HeadingFarm
                selectedTab={selectedTab}
                onTabSelect={onTabSelect}
                tabType="dashboard"
                counts={counts}
            />
            {showSkeleton ? (
                <PondListSkeleton />
            ) : (
                <ShrimpPondList
                    ref={flatListRef}
                    data={filteredData}
                    onPondPress={onPondPress}
                    onInfoPress={onPondInfoPress}
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshing={isRefetching}
                    onRefresh={onRefresh}
                    zoneId={selectedZoneId}
                    warehouseId={warehouseId}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    loaderFooter: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
