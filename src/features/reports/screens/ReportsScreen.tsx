import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@/styles';
import { HeadingReports } from '@/features/reports/components/HeadingReports';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { FarmData } from '@/features/farm/types/farm.types';

// ----------------------------------------------------------------
// SPACE FOR IMPORTING REPORT COMPONENTS
// ----------------------------------------------------------------
// import CompilationEnvChart from '@/features/reports/components/env-chart/CompilationEnvChart';

// [THÊM MỚI] Import wrapper và chart cần test

import ActivePondChart from '@/features/reports/components/active-pond/ActivePondChart';

// ----------------------------------------------------------------

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const ReportsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [selectedFarm, setSelectedFarm] = useState<DropDownItem>({
        id: '1',
        label: 'Trại Kiên Giang',
        value: '1',
    });

    // Mock data for DropDownReports matching the design image (hinh 2)
    // Pond Types: Ao vèo, Ao nuôi, Ao sẵn sàng
    const pondTypeData: DropDownItem[] = [
        { id: '1', label: 'Loại ao' }, // Placeholder/Default
        { id: '2', label: 'Ao vèo' },
        { id: '3', label: 'Ao nuôi' },
        { id: '4', label: 'Ao sẵn sàng' },
    ];
    const [selectedPondType, setSelectedPondType] = useState<DropDownItem>(pondTypeData[0]);

    // Ponds: {tên ao}
    const pondData: DropDownItem[] = [
        { id: '1', label: 'Chọn ao' }, // Placeholder/Default
        { id: '2', label: 'Ao 1' },
        { id: '3', label: 'Ao 2' },
        { id: '4', label: 'Ao 3' },
    ];
    const [selectedPond, setSelectedPond] = useState<DropDownItem>(pondData[0]);

    // Seasons: Vụ 1 - 2025, Vụ 2 - 2025, etc.
    const seasonData: DropDownItem[] = [
        { id: '1', label: 'Vụ 1 - 2025' },
        { id: '2', label: 'Vụ 2 - 2025' },
        { id: '3', label: 'Vụ 3 - 2025' },
        { id: '4', label: 'Vụ 4 - 2025' },
    ];
    const [selectedSeason, setSelectedSeason] = useState<DropDownItem>(seasonData[0]);

    const farmOptions: DropDownItem[] = [
        { id: '1', label: 'Trại Kiên Giang', value: '1' },
        { id: '2', label: 'Trại Cà Mau', value: '2' },
        { id: '3', label: 'Trại Bạc Liêu', value: '3' },
    ];

    const handleRightPress = () => {
        const farmData: FarmData = {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: '',
            address: '',
        };
        navigation.navigate('FarmInfo', { farm: farmData });
    };

    return (
        <View style={styles.container}>
            <HeadingReports
                farmData={farmOptions}
                selectedFarm={selectedFarm}
                onSelectFarm={setSelectedFarm}
                onRightPress={handleRightPress}
                pondTypeData={pondTypeData}
                selectedPondType={selectedPondType}
                onSelectPondType={setSelectedPondType}
                pondData={pondData}
                selectedPond={selectedPond}
                onSelectPond={setSelectedPond}
                seasonData={seasonData}
                selectedSeason={selectedSeason}
                onSelectSeason={setSelectedSeason}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* ---------------------------------------------------------------------------------- */}
                {/* PACED FOR REPORTS COMPONENTS                          */}
                {/* ---------------------------------------------------------------------------------- */}

                {/* <CompilationEnvChart /> */}

                {/* 2. <FeedProdChart />
                 */}

                {/* 3. <ActivePondChart /> */}
                <ActivePondChart />

                {/* 4. <ProdChart />
                 */}

                {/* 5. <ProfitChart />
                 */}

                {/* 6. <CostChart />
                 */}

                {/* 7. <HarvestChart />
                 */}

                {/* 8. <WaterUsage />
                 */}

                {/* 9. <PondTransfer />
                 */}

                {/* 10. <HarvestStat />
                 */}

                {/* ---------------------------------------------------------------------------------- */}
            </ScrollView>
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
    },
    contentContainer: {
        paddingBottom: 20,
    },
    text: {
        color: colors.text,
    },
});
