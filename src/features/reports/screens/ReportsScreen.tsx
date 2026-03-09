import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { HeadingReports } from '@/features/reports/components/HeadingReports';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
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
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useZones, usePondsByZone } from '@/features/farm/hooks';
import { spacing } from '@/styles/spacing';
import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';

type Props = NativeStackScreenProps<ReportStackParamList, 'ReportHome'>;

interface FarmData {
    id: string;
    name: string;
    code: string;
    area: string;
    address: string;
}

export const ReportsScreen = ({ navigation }: Props) => {
    const bottomBarHeight = useBottomTabBarHeight();
    // Ref for scroll to top
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef as any);

    // Global Farm State
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);

    // React Query Hooks (replacing farmStore fetchers)
    const { data: zonesData = [] } = useZones();
    // Fallback to empty array if undefined
    const zones = useMemo(() => zonesData || [], [zonesData]);

    // Map zones to DropDownItem format
    const farmOptions: DropDownItem[] = useMemo(() => {
        return zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
            value: z.code || z.id.toString(),
        }));
    }, [zones]);

    // Derived selectedFarm from global ID
    const selectedFarm = useMemo(() => {
        const found = farmOptions.find(f => f.id === selectedZoneId?.toString());
        return found || farmOptions[0] || { id: '1', label: 'Trại Kiên Giang' };
    }, [farmOptions, selectedZoneId]);

    const handleSelectFarm = (item: DropDownItem) => {
        setSelectedZoneId(String(item.id));
    };

    const { data: rawPonds } = usePondsByZone(selectedZoneId?.toString() || null);

    const pondData: DropDownItem[] = useMemo(() => {
        const defaultOption = { id: '1', label: 'Chọn ao' };
        if (!rawPonds || rawPonds.length === 0) return [defaultOption];

        const mapped = rawPonds.map(p => ({
            id: p.id.toString(),
            label: p.name,
            value: p.code || p.id.toString(),
        }));
        return [defaultOption, ...mapped];
    }, [rawPonds]);

    const [selectedPond, setSelectedPond] = useState<DropDownItem>(pondData[0]);

    // Update selected pond when data changes
    React.useEffect(() => {
        if (pondData.length > 0) {
            // Check if current selected pond still exists in new data
            const exists = pondData.find(p => p.id === selectedPond.id);
            if (!exists) {
                setSelectedPond(pondData[0]);
            }
        }
    }, [pondData, selectedPond.id]);

    const { data: rawSeasons } = useSeasonsByZone(selectedZoneId?.toString() || null);

    const seasonData: DropDownItem[] = useMemo(() => {
        const defaultOption = { id: '1', label: 'Chọn mùa vụ' };
        if (!rawSeasons || rawSeasons.length === 0) return [defaultOption];

        const mapped = rawSeasons.map(s => ({
            id: s.id.toString(),
            label: s.name || s.seasonName || `Mùa vụ ${s.id}`,
            value: s.seasonCode || s.id.toString(),
        }));
        return [defaultOption, ...mapped];
    }, [rawSeasons]);

    const [selectedSeason, setSelectedSeason] = useState<DropDownItem>(seasonData[0]);

    // Update selected season when data changes
    React.useEffect(() => {
        if (seasonData.length > 0) {
            // Check if current selected season still exists in new data
            const exists = seasonData.find(s => s.id === selectedSeason.id);
            if (!exists) {
                setSelectedSeason(seasonData[0]);
            }
        }
    }, [seasonData, selectedSeason.id]);

    const [isSeasonDisabled, setIsSeasonDisabled] = useState(false);

    const pondTypeData: DropDownItem[] = [
        { id: '1', label: 'Ao nuôi' },
        { id: '2', label: 'Ao vèo' },
        { id: '3', label: 'Ao lắng' },
        { id: '4', label: 'Ao xử lý' },
    ];
    const [selectedPondType, setSelectedPondType] = useState<DropDownItem>(pondTypeData[0]);

    const handleSelectPondType = (item: DropDownItem) => {
        setSelectedPondType(item);
        if (item.label === 'Ao vèo') {
            const autoSelectPond =
                pondData.find(p => p.label.toLowerCase().includes('vèo')) || pondData[0];
            setSelectedPond(autoSelectPond);
            setIsSeasonDisabled(true);
        } else {
            setIsSeasonDisabled(false);
            if (selectedPond.label.toLowerCase().includes('vèo')) {
                setSelectedPond(pondData[0]); // Reset to "Chọn ao"
            }
        }
    };

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
            <WaterUsageChart />
            <FoodChart />
            <PondTransfer />
        </>
    );

    const renderStandardContent = () => (
        <>
            <CompilationEnvChart />
            <CompilationFeedProd
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <ActivePondChart />
            <ProdChart />
            <CompilationProfitChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <CompilationCostChart />
            <HarvestChart
                zoneId={selectedZoneId?.toString() || ''}
                pondId={selectedPond.id !== '1' ? selectedPond.id?.toString() : undefined}
            />
            <PondTransfer />
            <HarvestStat />
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
