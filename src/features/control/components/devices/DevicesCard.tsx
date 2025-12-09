import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceCard, DeviceData } from './Devices';
import { EControlMode } from '../../types/control.types';
import { ButtonControlSwitch } from './ButtonControlSwitch';

// Mock Data
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

interface DevicesCardProps {
  title: string;
  devices?: DeviceData[]; // Optional now
  type?: 'feeder' | 'other'; // New prop to select mock data
  layout?: 'list' | 'grid';
  style?: import('react-native').ViewStyle;
  onToggle?: (id: string, val: boolean) => void;
  onSettingsPress?: (id: string) => void;
  onModePress?: (id: string) => void;
  // onMenuPress?: () => void; // Replaced by specific actions
  onSwitchToSchedule?: () => void;
  onSwitchToManual?: () => void;
}

export const DevicesCard: React.FC<DevicesCardProps> = ({
  title,
  devices,
  type,
  layout = 'list',
  style,
  onToggle,
  onSettingsPress,
  onModePress,
  onSwitchToSchedule,
  onSwitchToManual,
}) => {
  // Determine initial data
  const initialData =
    devices || (type === 'feeder' ? MOCK_FEEDERS : type === 'other' ? MOCK_OTHERS : []);
  const [localDevices, setLocalDevices] = useState<DeviceData[]>(initialData);

  // Update local state if props change (optional, but good for robustness)
  useEffect(() => {
    if (devices) {
      setLocalDevices(devices);
    }
  }, [devices]);

  const handleToggle = (id: string, val: boolean) => {
    // Update local state
    setLocalDevices(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
    // Call parent handler if provided
    onToggle?.(id, val);
  };

  // Switch all devices to Schedule mode
  const handleSwitchAllToSchedule = () => {
    setLocalDevices(prev => prev.map(d => ({ ...d, mode: EControlMode.SCHEDULE })));
    onSwitchToSchedule?.();
  };

  // Switch all devices to Manual mode
  const handleSwitchAllToManual = () => {
    setLocalDevices(prev => prev.map(d => ({ ...d, mode: EControlMode.MANUAL })));
    onSwitchToManual?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <ButtonControlSwitch
          onSwitchToSchedule={handleSwitchAllToSchedule}
          onSwitchToManual={handleSwitchAllToManual}
        />
      </View>

      <View style={layout === 'grid' ? styles.gridContainer : styles.listContainer}>
        {localDevices.map(device => (
          <DeviceCard
            key={device.id}
            data={device}
            onToggle={handleToggle}
            onSettingsPress={onSettingsPress}
            onModePress={onModePress}
            style={layout === 'grid' ? styles.gridItem : undefined}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16, // Consistent with design typically
    padding: 16,
    marginBottom: 24, // Spacing between cards
    // Shadow for the whole card
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12, // Visual separation
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContainer: {
    gap: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
});
