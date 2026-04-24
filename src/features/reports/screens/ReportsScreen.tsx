import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { useAppTheme } from '@/styles/themeContext';
import { HeadingReports } from '@/features/reports/components/HeadingReports';
import { HeadingBar, HeadingBarItem } from '@/shared/components/layout/HeadingBar';

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
import { RealTimeEnvList } from '@/features/reports/components/real-time-env/RealTimeEnvList';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { spacing } from '@/styles/spacing';
import { useReportsScreen } from '@/features/reports/hooks/useReportsScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';

/** Report screen tab keys */
const REPORT_TAB_KEYS = {
    ENV: 'env',
    OVERVIEW: 'overview',
} as const;

/** HeadingBar tabs for report screen */
const REPORT_TABS: HeadingBarItem[] = [
    { key: REPORT_TAB_KEYS.ENV, label: 'Thông số môi trường' },
    { key: REPORT_TAB_KEYS.OVERVIEW, label: 'Tổng quan' },
];

export const ReportsScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const bottomBarHeight = useBottomTabBarHeight();
    const queryClient = useQueryClient();
    // Ref for scroll to top
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef as any);

    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>(REPORT_TAB_KEYS.OVERVIEW);

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

    const { startOnboarding, hasCompletedReport, _hasHydrated, activeModule, currentStep } =
        useOnboardingStore();

    const envChartY = useRef(0);
    const prodChartY = useRef(0);

    React.useEffect(() => {
        if (_hasHydrated && !hasCompletedReport) {
            const timer = setTimeout(() => {
                startOnboarding('report');
            }, 500); // Add a small delay for better UX and layout stability
            return () => clearTimeout(timer);
        }
    }, [_hasHydrated, hasCompletedReport, startOnboarding]);

    React.useEffect(() => {
        if (activeModule === 'report') {
            if (currentStep === 3 && envChartY.current > 0) {
                // REPORT_CHART_ENV
                scrollViewRef.current?.scrollTo({
                    y: Math.max(0, envChartY.current - 120),
                    animated: true,
                });
            } else if (currentStep === 4 && prodChartY.current > 0) {
                // REPORT_CHART_PROD
                scrollViewRef.current?.scrollTo({
                    y: Math.max(0, prodChartY.current - 120),
                    animated: true,
                });
            } else if (currentStep < 3) {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }
        }
    }, [activeModule, currentStep]);

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
            <View
                onLayout={e => {
                    envChartY.current = e.nativeEvent.layout.y;
                }}
            >
                <CompilationEnvChart
                    zoneId={selectedZoneId?.toString() || ''}
                    pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                    seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
                />
            </View>
            <GrowthChart />
            <View
                onLayout={e => {
                    prodChartY.current = e.nativeEvent.layout.y;
                }}
            >
                <ProdChart
                    zoneId={selectedZoneId?.toString() || ''}
                    pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                    seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
                />
            </View>
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
            <View
                onLayout={e => {
                    envChartY.current = e.nativeEvent.layout.y;
                }}
            >
                <CompilationEnvChart
                    zoneId={selectedZoneId?.toString() || ''}
                    pondIds={selectedPond.id !== '1' ? [selectedPond.id?.toString()] : undefined}
                    seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
                />
            </View>
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <ActivePondChart
                zoneId={selectedZoneId?.toString() || ''}
                seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
            />
            <View
                onLayout={e => {
                    prodChartY.current = e.nativeEvent.layout.y;
                }}
            >
                <ProdChart
                    zoneId={selectedZoneId?.toString() || ''}
                    pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                    seasonId={selectedSeason.id !== '1' ? selectedSeason.id?.toString() : undefined}
                />
            </View>
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

            <HeadingBar
                tabs={REPORT_TABS}
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                flexTabs
                containerStyle={{ marginBottom: spacing.sm }}
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
                    {selectedTab === REPORT_TAB_KEYS.OVERVIEW ? (
                        selectedPondType.label === 'Ao vèo' ? (
                            renderAoVeoContent()
                        ) : (
                            renderStandardContent()
                        )
                    ) : (
                        <RealTimeEnvList
                            pondId={
                                selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined
                            }
                        />
                    )}
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
