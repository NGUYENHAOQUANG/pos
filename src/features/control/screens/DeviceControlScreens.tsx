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
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Zone } from '@/features/farm/types/farm.types';

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const { zones, fetchZones } = useFarmStore();

    // Load zones on mount
    React.useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const [selectedFarm, setSelectedFarm] = useState<FarmLocation | undefined>(undefined);

    // Map zones to FarmLocation format
    const farmLocations: FarmLocation[] = useMemo(() => {
        if (!zones || zones.length === 0) return [];
        return zones.map((z: Zone) => ({
            id: z.id.toString(),
            name: z.name,
        }));
    }, [zones]);

    // Set default selected farm
    React.useEffect(() => {
        if (!selectedFarm && farmLocations.length > 0) {
            setSelectedFarm(farmLocations[0]);
        }
    }, [farmLocations, selectedFarm]);

    const { ponds } = useControl();

    const handleConnectDevice = (pondName: string) => {
        navigation.navigate('ConnectDevice', { pondName });
    };

    const showDashboard = ponds.some(p => p.hasDevices);

    const filteredPonds = useMemo(() => {
        if (!selectedFarm) return ponds;

        // Find the selected zone to get its code
        const selectedZone = zones?.find(z => z.id.toString() === selectedFarm.id);
        if (!selectedZone) return ponds;

        return ponds.filter(pond => {
            // Check if ANY device in the pond belongs to the selected farm/zone
            // We assume device.farmId corresponds to zone.code
            if (pond.devices && pond.devices.length > 0) {
                return pond.devices.some(d => d.farmId === selectedZone.code);
            }
            // If pond has no devices, strictly it shouldn't show in Control screen for a specific farm unless we know its farm.
            // But mock ponds (N01, etc) likely don't have farmId on the pond object itself in controlStore types.
            // So we rely on mapping logic or assume they belong to the default farm if code matches.
            // Since User complaining "Sao không get được", likely they selected valid farm but got nothing (or expected to see N01 etc).
            // Logic: Filter STRICTLY. If no devices match, don't show.
            return false;
        });
    }, [ponds, selectedFarm, zones]);

    // Calculate total active devices and warnings for summary based on FILTERED ponds
    const totalStats = useMemo(() => {
        // Calculate total warnings across all ponds (sum of all devices with warning status)
        const sumWarnings = filteredPonds.reduce((acc, pond) => {
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
        const countPondsWithDevices = filteredPonds.filter(p => p.hasDevices).length;

        return {
            warning: sumWarnings,
            active: countPondsWithDevices,
            other: filteredPonds.length - countPondsWithDevices,
        };
    }, [filteredPonds]);

    return (
        <View style={styles.container}>
            {showDashboard && (
                <HeaderCamLocation
                    locations={farmLocations.length > 0 ? farmLocations : undefined}
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
                            totalPonds={filteredPonds.length}
                            activePonds={totalStats.active}
                            warningPonds={totalStats.warning}
                            otherPonds={totalStats.other}
                        />
                        <View style={styles.spacer} />
                    </>
                )}

                {filteredPonds.map(pond => (
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
