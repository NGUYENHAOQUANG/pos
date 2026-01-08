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

export const ShrimpPondListScreens: React.FC<ShrimpPondListScreensProps> = () => {
    const navigation = useNavigation<NavigationProp>();
    const { ponds, getLatestPondActivity, activeCycles, getCyclesByPondId } = useFarm();
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

    const checkHasActivity = useCallback(
        (pondId: string) => {
            const activity = getLatestPondActivity(pondId);
            return !!activity?.lastActivity && activity.lastActivity !== '-';
        },
        [getLatestPondActivity]
    );

    const checkHasCycle = useCallback(
        (pondId: string) => {
            const currentCycle = activeCycles[pondId];
            if (currentCycle) return true;
            // Check receiving ponds (if this pond is part of a transfer)
            const cycles = getCyclesByPondId(pondId);
            return cycles.some(c => c.receivingPonds?.includes(pondId));
        },
        [activeCycles, getCyclesByPondId]
    );

    // Generic status checker for consistency with ShrimpPondList's getStatus
    const getComputedStatus = useCallback(
        (pond: any) => {
            const hasActivity = checkHasActivity(pond.id);
            const hasCycle = checkHasCycle(pond.id);

            if (!hasActivity && !hasCycle) return undefined;

            // FIX: "Ao sẵn sàng" only shows status (and effectively changes type visual)
            // when a cycle is active. If just doing work without cycle, keep clean.
            if (pond.type === 'Ao sẵn sàng' && !hasCycle) {
                return undefined;
            }

            if (['Ao sẵn sàng', 'Ao vèo', 'Ao lắng'].includes(pond.type)) {
                return 'preparing';
            }

            if (pond.type === 'Ao nuôi') {
                return 'active';
            }

            if (pond.status === 'Đang hoạt động') return 'active';
            if (pond.status === 'Chuẩn bị') return 'preparing';

            return undefined;
        },
        [checkHasActivity, checkHasCycle]
    );

    // Calculate counts based on COMPUTED status (requires activity + generic rules)
    const counts = useMemo(() => {
        const all = ponds.length;
        const active = ponds.filter(pond => getComputedStatus(pond) === 'active').length;
        const preparing = ponds.filter(pond => getComputedStatus(pond) === 'preparing').length;
        return { all, active, preparing };
    }, [ponds, getComputedStatus]);

    const filteredData = useMemo(() => {
        if (selectedTab === 'all') {
            return ponds;
        }
        if (selectedTab === 'active') {
            return ponds.filter(pond => getComputedStatus(pond) === 'active');
        }
        if (selectedTab === 'preparing') {
            return ponds.filter(pond => getComputedStatus(pond) === 'preparing');
        }
        return ponds;
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
