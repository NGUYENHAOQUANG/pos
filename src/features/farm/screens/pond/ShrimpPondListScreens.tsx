import { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { FarmData } from '@/features/farm/types/farm.types';
import { useFarm } from '@/features/farm/store/farmStore';

interface ShrimpPondListScreensProps {}

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

// Sort order map
const POND_TYPE_ORDER: Record<string, number> = {
    'Ao vèo': 1,
    'Ao nuôi': 2,
    'Ao sẵn sàng': 3,
    'Ao chứa nước': 4,
    'Ao xử lý': 5,
    'Ao thải': 6,
    'Ao lắng': 7,
};

export const ShrimpPondListScreens: React.FC<ShrimpPondListScreensProps> = () => {
    const navigation = useNavigation<NavigationProp>();
    const { ponds, activeCycles, getCyclesByPondId } = useFarm();
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedFarm, setSelectedFarm] = useState<DropDownItem>({
        id: '1',
        label: 'Trại Kiên Giang',
        value: '1',
    });

    const farmOptions: DropDownItem[] = [
        { id: '1', label: 'Trại Kiên Giang', value: '1' },
        { id: '2', label: 'Trại Cà Mau', value: '2' },
        { id: '3', label: 'Trại Bạc Liêu', value: '3' },
    ];

    const handlePondPress = (pond: any) => {
        navigation.navigate('PondDetail', { pond });
    };

    const handlePondInfoPress = (pond: any) => {
        navigation.navigate('PondInfo', { pond });
    };

    const handleFarmInfoPress = () => {
        const farmData: FarmData = {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: '',
            address: '',
        };
        navigation.navigate('FarmInfo', { farm: farmData });
    };

    const checkHasCycle = useCallback(
        (pondId: string) => {
            const currentCycle = activeCycles[pondId];
            if (currentCycle) return true;
            // Relaxed check: ANY cycle implies Active
            const cycles = getCyclesByPondId(pondId);
            return cycles.length > 0;
        },
        [activeCycles, getCyclesByPondId]
    );

    // Generic status checker for consistency with ShrimpPondList's getStatus
    const getComputedStatus = useCallback(
        (pond: any) => {
            const hasCycle = checkHasCycle(pond.id);

            // User request: "Any pond with a cycle is Active, otherwise Preparing"
            if (hasCycle) {
                return 'active';
            }
            return 'preparing';
        },
        [checkHasCycle]
    );

    // Calculate counts based on COMPUTED status (requires activity + generic rules)
    const counts = useMemo(() => {
        const all = ponds.length;
        const active = ponds.filter(pond => getComputedStatus(pond) === 'active').length;
        const preparing = ponds.filter(pond => getComputedStatus(pond) === 'preparing').length;
        return { all, active, preparing };
    }, [ponds, getComputedStatus]);

    const filteredData = useMemo(() => {
        let data = ponds;
        if (selectedTab === 'active') {
            data = ponds.filter(pond => getComputedStatus(pond) === 'active');
        } else if (selectedTab === 'preparing') {
            data = ponds.filter(pond => getComputedStatus(pond) === 'preparing');
        }

        return [...data].sort((a, b) => {
            const orderA = POND_TYPE_ORDER[a.type] || 99;
            const orderB = POND_TYPE_ORDER[b.type] || 99;
            return orderA - orderB;
        });
    }, [selectedTab, ponds, getComputedStatus]);

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="list"
                data={farmOptions}
                value={selectedFarm}
                onSelect={setSelectedFarm}
                onMenuPress={handleFarmInfoPress}
            />
            <HeadingFarm
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                tabType="dashboard"
                counts={counts}
            />
            <ShrimpPondList
                data={filteredData}
                onPondPress={handlePondPress}
                onInfoPress={handlePondInfoPress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
});
