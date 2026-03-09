import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportStackParamList } from '@/features/reports/navigation/ReportNavigator';
import { PondInfor } from '@/features/reports/components/PondInfor';
import { OverView } from '@/features/reports/components/OverView';
import WaterUsageChart from '@/features/reports/components/water-usage/WaterUsageChart';
import { useScrollToTop } from '@react-navigation/native';
import { spacing } from '@/styles/spacing';
import { FarmData } from '@/features/reports/types/reports';
import { useReportsScreen } from '@/features/reports/hooks/useReportsScreen';

type Props = NativeStackScreenProps<ReportStackParamList, 'ReportHome'>;

export const ReportsScreen = ({ navigation }: Props) => {
    const bottomBarHeight = useBottomTabBarHeight();
    // Ref for scroll to top
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef as any);

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
        allPondsForLookup,
        rawCycles,
    } = useReportsScreen();

    const handleRightPress = () => {
        const farmData: FarmData = {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: '',
            address: '',
        };
        // @ts-ignore
        navigation.navigate('FarmInfo', { farm: farmData });
    };

    const renderAoVeoContent = () => (
        <>
            <PondInfor />
            <OverView />
            <CompilationEnvChart />
            <GrowthChart />
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <CompilationProfitChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <CompilationCostChart />
            <WaterUsageChart zoneId={selectedZoneId?.toString() || ''} />
            <FoodChart />
            <PondTransfer
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                ponds={allPondsForLookup}
            />
        </>
    );

    const renderStandardContent = () => (
        <>
            <CompilationEnvChart />
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <ActivePondChart zoneId={selectedZoneId?.toString() || ''} />
            <ProdChart />
            <CompilationProfitChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <CompilationCostChart />
            <WaterUsageChart zoneId={selectedZoneId?.toString() || ''} />
            <HarvestChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <PondTransfer
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                ponds={allPondsForLookup}
            />
            <HarvestStat
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
                ponds={allPondsForLookup}
                cycles={rawCycles?.data?.items}
            />
        </>
    );

    return (
        <View style={styles.container}>
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
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
        marginHorizontal: spacing.md,
    },
});
