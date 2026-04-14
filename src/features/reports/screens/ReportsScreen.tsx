import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { useAppTheme } from '@/styles/themeContext';
import { HeadingReports } from '@/features/reports/components/HeadingReports';

import { useBottomTabBarHeight } from '@/app/navigation/BottomBarContext';
import CompilationEnvChart from '@/features/reports/components/env-chart/CompilationEnvChart';
import { ProdChart } from '@/features/reports/components/prod-chart/ProdChart';
import { GrowthChart } from '@/features/reports/components/growth-chart/GrowthChart';
import { CompilationFeedProd } from '@/features/reports/components/feed-prod/CompilationFeedProd';
import { CompilationProfitChart } from '@/features/reports/components/profit-chart/CompilationProfitChart';
import CompilationCostChart from '@/features/reports/components/cost-chart/CompilationCostChart';
import { ActivePondChart } from '@/features/reports/components/active-pond/ActivePondChart';
import { HarvestChart } from '@/features/reports/components/harvest-chart/HarvestChart';
import { FoodChart } from '@/features/reports/components/food-chart/FoodChart';
import { HarvestStat } from '@/features/reports/components/harvest-stat/HarvestStat';
import { PondTransfer } from '@/features/reports/components/pond-transfer/PondTransfer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { PondInfor } from '@/features/reports/components/PondInfor';
import { OverView } from '@/features/reports/components/OverView';
import WaterUsageChart from '@/features/reports/components/water-usage/WaterUsageChart';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { spacing } from '@/styles/spacing';
import { useReportsScreen } from '@/features/reports/hooks/useReportsScreen';
import { useQueryClient } from '@tanstack/react-query';

export const ReportsScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const bottomBarHeight = useBottomTabBarHeight();
    const queryClient = useQueryClient();
    // Ref for scroll to top
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef as any);

    const [refreshing, setRefreshing] = useState(false);

    const {
        selectedZoneId,
        farmOptions,
        selectedFarm,
        handleSelectFarm,
        pondData,
        selectedPond,
        setSelectedPond,
        seasonData,
        selectedSeason,
        setSelectedSeason,
        isSeasonDisabled,
        pondTypeData,
        selectedPondType,
        handleSelectPondType,
    } = useReportsScreen();

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries();
        setRefreshing(false);
    }, [queryClient]);

    const handleRightPress = () => {
        navigation.navigate('NotificationList');
    };

    const renderAoVeoContent = () => (
        <>
            <PondInfor />
            <OverView />
            <CompilationEnvChart
                zoneId={selectedZoneId?.toString() || ''}
                pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <GrowthChart />
            <ProdChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationProfitChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationCostChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <WaterUsageChart
                zoneId={selectedZoneId?.toString() || ''}
                pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <FoodChart />
            <PondTransfer
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
        </>
    );

    const renderStandardContent = () => (
        <>
            <CompilationEnvChart
                zoneId={selectedZoneId?.toString() || ''}
                pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <ActivePondChart
                zoneId={selectedZoneId?.toString() || ''}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <ProdChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationProfitChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <CompilationCostChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <WaterUsageChart
                zoneId={selectedZoneId?.toString() || ''}
                pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <HarvestChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <PondTransfer
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <HarvestStat
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
            <HeadingReports
                farmData={farmOptions}
                selectedFarm={selectedFarm}
                onSelectFarm={handleSelectFarm}
                onRightPress={handleRightPress}
                pondTypeData={pondTypeData}
                selectedPondType={selectedPondType}
                onSelectPondType={handleSelectPondType}
                pondData={pondData}
                selectedPond={selectedPond}
                onSelectPond={setSelectedPond}
                seasonData={seasonData}
                selectedSeason={selectedSeason}
                onSelectSeason={setSelectedSeason}
                seasonDisabled={isSeasonDisabled}
            />

            <View style={styles.content}>
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: bottomBarHeight, gap: 6 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {selectedPondType.label === 'Ao vèo'
                        ? renderAoVeoContent()
                        : renderStandardContent()}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginHorizontal: spacing.md,
    },
});
