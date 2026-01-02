import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HeaderDevices, CONTROL_TABS } from '../../components/HeaderDevices';
import { HistoryActivitie } from '../../components/schedule/HistoryActivitie';
import FilterDate from '../../components/schedule/FilterDate';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { colors, spacing } from '@/styles';
import SensorStatisticsScreen from '../SensorStatisticsScreen/SensorStatisticsScreen';
import { Loading } from '@/shared/components/ui/Loading';
import {
    DEVICES_LIST,
    ACTIVITY_HISTORY,
    MODE_HISTORY,
    PONDS_LIST,
} from '@/features/control/data/devicesData';

import { useRoute, RouteProp } from '@react-navigation/native';
import { ControlStackParamList } from '../../navigation/ControlNavigator';

interface HistoryActivitieScreensProps {
    pondName?: string;
    onBack?: () => void;
}

export const HistoryActivitieScreens: React.FC<HistoryActivitieScreensProps> = ({ onBack }) => {
    const route = useRoute<RouteProp<ControlStackParamList, 'History'>>();
    // Get pondName from route params, default to 'Ao 1' if missing (though it should be there)
    const { pondName = 'Ao 1' } = route.params || {};

    const { setTabBarVisible } = useTabBarVisibility();
    const [activeTab, setActiveTab] = React.useState(CONTROL_TABS[0].key);
    const [isLoading, setIsLoading] = React.useState(true);

    // Get current pond object to find ID
    const currentPond = React.useMemo(() => {
        return PONDS_LIST.find(p => p.name === pondName) || PONDS_LIST[0];
    }, [pondName]);

    React.useEffect(() => {
        // Hide custom tab bar
        setTabBarVisible(false);

        // Mock loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            // Restore custom tab bar
            setTabBarVisible(true);
            clearTimeout(timer);
        };
    }, [setTabBarVisible]);

    const renderRightComponent = () => (
        <View style={styles.rightComponentContainer}>
            <Text style={styles.rightText}>{currentPond.id}</Text>
        </View>
    );

    const historyDevices = React.useMemo(() => {
        // 1. Get Pond ID
        const pondId = currentPond.id;

        // 2. Get Devices for this Pond
        const devices = DEVICES_LIST.filter(d => d.pondId === pondId);

        // 3. Map to Chart Data
        const typeCounters: Record<string, number> = {};

        return devices.map(d => {
            // Increment counter
            if (!typeCounters[d.type]) typeCounters[d.type] = 0;
            const index = ++typeCounters[d.type];

            // Get Activity History
            const activities = ACTIVITY_HISTORY.filter(
                h => h.deviceId === d.id && h.date === '25/12/2025'
            ) // Mock date
                .map(h => ({
                    startTime: h.startTime,
                    endTime: h.endTime,
                }));

            // Get Mode History
            const modeHistory = MODE_HISTORY.filter(
                h => h.deviceId === d.id && h.date === '25/12/2025'
            ) // Mock date
                .map(h => ({
                    startTime: h.startTime,
                    endTime: h.endTime,
                    mode: h.mode,
                }));

            // Default mode history if missing (fallback)
            if (modeHistory.length === 0) {
                modeHistory.push({ startTime: '00:00', endTime: '24:00', mode: 'remote' });
            }

            return {
                type: d.type,
                count: index,
                activities: activities,
                modeHistory: modeHistory,
            };
        });
    }, [currentPond.id]);

    return (
        <View style={styles.container}>
            <HeaderDevices
                tabs={CONTROL_TABS}
                selectedTab={activeTab}
                onTabSelect={setActiveTab}
                onBackPress={onBack}
                rightComponent={renderRightComponent()}
            />
            <View style={styles.content}>
                {isLoading ? (
                    <Loading />
                ) : activeTab === 'history' ? (
                    <>
                        <View style={styles.filterWrapper}>
                            <FilterDate />
                        </View>
                        <HistoryActivitie devices={historyDevices} />
                    </>
                ) : (
                    <SensorStatisticsScreen pondId={currentPond.id} />
                )}
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
        paddingBottom: 0,
    },
    filterWrapper: {
        marginTop: spacing.md,
        marginBottom: spacing.xs, // Small gap before list
    },
    rightComponentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rightText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
});
