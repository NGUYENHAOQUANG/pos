import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeaderDevices } from '../components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '../components/HeaderCamLocation';
import { ButtonHelp } from '../components/ButtonHelp';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';
import { colors } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useControl } from '../context/ControlContext';

// Define pond count for each farm - Removed unused config

export const DeviceControlScreens = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();

  // Use state only for the setter if reading is not needed, or rename if it should be used.
  // Assuming we only need to handle selection updates from the header for now.
  const [, setSelectedFarm] = useState<FarmLocation>({
    id: '1',
    name: 'Trại Kiên Giang',
  });

  const { ponds } = useControl();

  const handleConnectDevice = (pondName: string) => {
    navigation.navigate('ConnectDevice', { pondName });
  };

  // No longer using renderPondCards helper, mapping directly below

  // Only show dashboard (header + stats) if at least one pond has devices
  // This matches the design flow where the setup phase is cleaner
  const showDashboard = ponds.some(p => p.hasDevices);

  // Calculate total active devices and warnings
  const totalWarnings = ponds.reduce((acc, pond) => {
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

  return (
    <View style={styles.container}>
      {showDashboard && <HeaderCamLocation onLocationSelect={setSelectedFarm} />}
      <HeaderDevices
        title="Điều Khiển Thiết Bị"
        rightComponent={<ButtonHelp />}
        showBackButton={false}
        includeSafeArea={!showDashboard} // Add padding if top header is missing
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          styles.scrollContentPadding, // Ensure separation from header
        ]}
      >
        {showDashboard && (
          <>
            <DevicesStatus
              totalPonds={ponds.length}
              // activePonds currently implies active ponds, but might need adjustment if it means active devices.
              // Keeping logic as ponds.filter(p => p.hasDevices).length for "Hoạt động" (Active Ponds) based on previous code.
              activePonds={ponds.filter(p => p.hasDevices).length}
              warningPonds={totalWarnings} // Mapping total device warnings to this prop
              otherPonds={0}
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
            onPressDetail={() => navigation.navigate('ControlDetail', { pondName: pond.name })}
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
    flexGrow: 1, // Ensure content can grow to fill screen for centering
  },
  scrollContentPadding: {
    paddingTop: 16,
  },
  spacer: {
    height: 16,
  },
});
