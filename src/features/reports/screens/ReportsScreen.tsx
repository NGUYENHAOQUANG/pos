import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { HeadingReports } from '@/features/reports/components/HeadingReports';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useZones } from '@/features/farm/hooks';

type Props = NativeStackScreenProps<ReportStackParamList, 'ReportHome'>;

interface FarmData {
    id: string;
    name: string;
    code: string;
    area: string;
    address: string;
}

export const ReportsScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
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

    // Default select Farm logic (Global Sync)
    useEffect(() => {
        if (zones.length > 0) {
            // Check if current selectedZoneId is valid
            const isValidZone = selectedZoneId && zones.some(z => z.id === selectedZoneId);

            if (!isValidZone) {
                // Priority: Zone ID 71 (Trại Kiên Giang) -> First Zone
                const targetZone = zones.find(z => z.id === 71) || zones[0];
                if (targetZone) {
                    setSelectedZoneId(targetZone.id);
                }
            }
        }
    }, [zones, selectedZoneId, setSelectedZoneId]);

    const handleSelectFarm = (item: DropDownItem) => {
        setSelectedZoneId(Number(item.id));
    };

    const [selectedPond, setSelectedPond] = useState<DropDownItem>({ id: '1', label: 'Chọn ao' });
    const pondTypeData: DropDownItem[] = [
        { id: '1', label: 'Ao nuôi' },
        { id: '2', label: 'Ao vèo' },
        { id: '3', label: 'Ao lắng' },
        { id: '4', label: 'Ao xử lý' },
    ];
    const [selectedPondType, setSelectedPondType] = useState<DropDownItem>(pondTypeData[0]);

    const pondData: DropDownItem[] = [
        { id: '1', label: 'Chọn ao' },
        { id: 'ck1', label: 'Vụ I - CK1' },
        { id: '2', label: 'Ao 2' },
        { id: '3', label: 'Ao 3' },
    ];

    const seasonData: DropDownItem[] = [
        { id: '1', label: 'Vụ 1 - 2025' },
        { id: '2', label: 'Vụ 2 - 2025' },
        { id: '3', label: 'Vụ 3 - 2025' },
        { id: '4', label: 'Vụ 4 - 2025' },
    ];
    const [selectedSeason, setSelectedSeason] = useState<DropDownItem>(seasonData[0]);
    const [isSeasonDisabled, setIsSeasonDisabled] = useState(false);

    const handleSelectPondType = (item: DropDownItem) => {
        setSelectedPondType(item);
        if (item.label === 'Ao vèo') {
            const autoSelectPond = { id: 'ck1', label: 'Vụ I - CK1' };
            setSelectedPond(autoSelectPond);
            setIsSeasonDisabled(true);
        } else {
            setIsSeasonDisabled(false);
            if (selectedPond.id === 'ck1') {
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
            <CompilationFeedProd />
            <CompilationProfitChart />
            <CompilationCostChart />
            <WaterUsageChart />
            <FoodChart />
            <PondTransfer />
        </>
    );

    const renderStandardContent = () => (
        <>
            <CompilationEnvChart />
            <CompilationFeedProd />
            <ActivePondChart />
            <ProdChart />
            <CompilationProfitChart />
            <CompilationCostChart />
            <HarvestChart />
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
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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
        paddingHorizontal: 0,
    },
});
