import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeaderDevices } from '../components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '../components/HeaderCamLocation';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';
import { colors } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useControl } from '../store/controlStore';

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();

    const [selectedFarm, setSelectedFarm] = useState<FarmLocation>({
        id: '1',
        name: 'Trại Kiên Giang',
    });

    const { ponds } = useControl();

    const handleConnectDevice = (pondName: string) => {
        navigation.navigate('ConnectDevice', { pondName });
    };

    const showDashboard = ponds.some(p => p.hasDevices);

    // Calculate total active devices and warnings for summary
    const totalStats = useMemo(() => {
        // Calculate total warnings across all ponds (sum of all devices with warning status)
        const sumWarnings = ponds.reduce((acc, pond) => {
            if (!pond.deviceStats) return acc;
            const stats = pond.deviceStats;
            return (
                acc +
                (stats.fan.warning || 0) +
                (stats.feeder.warning || 0) +
                (stats.oxy.warning || 0) +
                (stats.syphon.warning || 0)
            );
        }, 0);

        // Calculate total active ponds (ponds that have at least one device connected)
        const countPondsWithDevices = ponds.filter(p => p.hasDevices).length;

        return {
            warning: sumWarnings,
            active: countPondsWithDevices,
            other: ponds.length - countPondsWithDevices,
        };
    }, [ponds]);

    return (
        <View style={styles.container}>
            {showDashboard && (
                <HeaderCamLocation
                    selectedLocation={selectedFarm}
                    onLocationSelect={setSelectedFarm}
                    onHelpPress={() => navigation.navigate('UserManual')}
                />
            )}
            <HeaderDevices
                title="Điều Khiển Thiết Bị"
                showBackButton={false}
                includeSafeArea={!showDashboard}
            />
            <ScrollView
                style={styles.content}
                contentContainerStyle={[styles.scrollContent, styles.scrollContentPadding]}
            >
                {showDashboard && (
                    <>
                        <DevicesStatus
                            totalPonds={ponds.length}
                            activePonds={totalStats.active}
                            warningPonds={totalStats.warning}
                            otherPonds={totalStats.other}
                        />
                        <View style={styles.spacer} />
                    </>
                )}

                {ponds.map(pond => (
                    <PondCard
                        key={pond.id}
                        pondName={pond.name}
                        isEmpty={!pond.hasDevices}
                        deviceStats={pond.deviceStats}
                        onPressDetail={() =>
                            navigation.navigate('ControlDetail', { pondName: pond.name })
                        }
                        onAddDevice={() => handleConnectDevice(pond.name)}
                    />
                ))}
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
    scrollContent: {
        paddingBottom: 100,
        flexGrow: 1,
    },
    scrollContentPadding: {
        paddingTop: 16,
    },
    spacer: {
        height: 16,
    },
});
