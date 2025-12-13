import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeaderDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { colors, spacing } from '@/styles';
import CustomFeedingMachine from '../CustomFeedingMachine/CustomFeedingMachineScreen';
import { DeviceData } from '../../components/devices/Devices';
import { EControlMode } from '../../types/control.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '../../navigation/ControlNavigator';
// Mock Data (moved from DevicesCard)
const MOCK_FEEDERS: DeviceData[] = [
  {
    id: 'f1',
    name: 'Máy cho ăn',
    icon: require('@/assets/images/Icon/IconDevices/feeder.png'),
    mode: EControlMode.MANUAL,
    isOn: true,
  },
];

const MOCK_OTHERS: DeviceData[] = [
  {
    id: 'o1',
    name: 'Quạt nước 1',
    icon: require('@/assets/images/Icon/IconDevices/fan.png'),
    mode: EControlMode.SCHEDULE,
    isOn: true,
  },
  {
    id: 'o2',
    name: 'Quạt nước 2',
    icon: require('@/assets/images/Icon/IconDevices/fan.png'),
    mode: EControlMode.LOCAL,
    isOn: true,
  },
  {
    id: 'o3',
    name: 'Máy thổi khí',
    icon: require('@/assets/images/Icon/IconDevices/oxy.png'),
    mode: EControlMode.SCHEDULE,
    isOn: true,
    errorMessage: 'Bị mất khí!',
  },
  {
    id: 'o4',
    name: 'Syphon',
    icon: require('@/assets/images/Icon/IconDevices/syphon.png'),
    mode: EControlMode.SCHEDULE,
    isOn: false,
  },
];

interface DevicesInPondScreensProps {
  // onBack?: () => void;
  // pondName?: string;
}

type ViewMode = 'list' | 'customFeeding'; // Removed schedule/history from internal state

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
  const route = useRoute<RouteProp<ControlStackParamList, 'ControlDetail'>>();
  const { pondName = 'Ao 1' } = route.params || {};

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [feeders, setFeeders] = useState<DeviceData[]>(MOCK_FEEDERS);
  const [otherDevices, setOtherDevices] = useState<DeviceData[]>(MOCK_OTHERS);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Show Custom Feeding Machine Screen (Keep as internal modal for now or move to stack properly later if needed)
  if (viewMode === 'customFeeding') {
    // ... same logic
    const selectedDevice =
      feeders.find(d => d.id === selectedDeviceId) ||
      otherDevices.find(d => d.id === selectedDeviceId);
    const initialMode = selectedDevice?.mode === EControlMode.SCHEDULE ? 'schedule' : 'manual';

    return (
      <CustomFeedingMachine
        initialMode={initialMode}
        onBack={() => {
          setViewMode('list');
          setSelectedDeviceId(null);
        }}
        onSave={newMode => {
          // ... same logic
          const updatedMode = newMode === 'schedule' ? EControlMode.SCHEDULE : EControlMode.MANUAL;

          if (feeders.some(d => d.id === selectedDeviceId)) {
            setFeeders(prev =>
              prev.map(d => (d.id === selectedDeviceId ? { ...d, mode: updatedMode } : d))
            );
          } else {
            setOtherDevices(prev =>
              prev.map(d => (d.id === selectedDeviceId ? { ...d, mode: updatedMode } : d))
            );
          }
          setViewMode('list');
          setSelectedDeviceId(null);
        }}
      />
    );
  }

  const handleSettingsPress = (id: string) => {
    setSelectedDeviceId(id);
    setViewMode('customFeeding');
  };

  return (
    <View style={styles.container}>
      <HeaderDevices title={`Thiết Bị - ${pondName}`} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* History Buttons Section */}
        <View style={styles.historySection}>
          <ButtonHistory
            onSchedulePress={() => navigation.navigate('Schedule', { pondName })}
            onStatisticPress={() => navigation.navigate('History', { pondName })}
            style={styles.historyButton}
          />
        </View>

        {/* Feeder Section */}
        <DevicesCard
          title="Máy cho ăn"
          devices={feeders}
          layout="grid"
          onSettingsPress={handleSettingsPress}
          onSwitchToSchedule={() =>
            setFeeders(prev => prev.map(d => ({ ...d, mode: EControlMode.SCHEDULE })))
          }
          onSwitchToManual={() =>
            setFeeders(prev => prev.map(d => ({ ...d, mode: EControlMode.MANUAL })))
          }
          onToggle={(id, val) =>
            setFeeders(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)))
          }
          style={styles.extendedCard}
        />

        {/* Other Devices Section */}
        <DevicesCard
          title="Thiết bị khác"
          devices={otherDevices}
          layout="grid"
          onSettingsPress={handleSettingsPress}
          onSwitchToSchedule={() =>
            setOtherDevices(prev => prev.map(d => ({ ...d, mode: EControlMode.SCHEDULE })))
          }
          onSwitchToManual={() =>
            setOtherDevices(prev => prev.map(d => ({ ...d, mode: EControlMode.MANUAL })))
          }
          onToggle={(id, val) =>
            setOtherDevices(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)))
          }
          style={styles.extendedCard}
        />
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
    padding: spacing.md,
    paddingBottom: 40,
  },
  historySection: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
  },
  historyButton: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  extendedCard: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
});
