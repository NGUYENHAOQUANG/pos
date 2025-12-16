import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceCard, DeviceData } from './Devices';
import { ButtonControlSwitch } from './ButtonControlSwitch'; // Assuming it's in the same folder or adjusted path
import { EControlMode } from '../../types/control.types';

import FanIcon from '@/assets/images/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/images/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/images/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/images/Icon/IconDevices/syphon.svg';

export const DevicesInPond = () => {
  // Mock Data for Feeder Section
  const [feeders, setFeeders] = useState<DeviceData[]>([
    {
      id: 'f1',
      name: 'Máy cho ăn',
      icon: FeederIcon,
      mode: EControlMode.MANUAL,
      isOn: true,
    },
  ]);

  // Mock Data for Other Devices Section
  const [otherDevices, setOtherDevices] = useState<DeviceData[]>([
    {
      id: 'o1',
      name: 'Quạt nước 1',
      icon: FanIcon,
      mode: EControlMode.SCHEDULE,
      isOn: true,
    },
    {
      id: 'o2',
      name: 'Quạt nước 2',
      icon: FanIcon,
      mode: EControlMode.LOCAL,
      isOn: true,
    },
    {
      id: 'o3',
      name: 'Máy thổi khí',
      icon: OxyIcon,
      mode: EControlMode.SCHEDULE,
      isOn: true,
      errorMessage: 'Bị mất khí!',
    },
    {
      id: 'o4',
      name: 'Syphon',
      icon: SyphonIcon,
      mode: EControlMode.SCHEDULE,
      isOn: false,
    },
  ]);

  const handleFeederToggle = (id: string, val: boolean) => {
    setFeeders(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
  };

  const handleOtherToggle = (id: string, val: boolean) => {
    setOtherDevices(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
  };

  return (
    <View style={styles.container}>
      {/* Feeder Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Máy cho ăn</Text>
          <ButtonControlSwitch
            onSwitchToManual={() => console.log('Feeder to Manual')}
            onSwitchToSchedule={() => console.log('Feeder to Schedule')}
          />
        </View>
        <View style={styles.cardWrapper}>
          {feeders.map(device => (
            <DeviceCard key={device.id} data={device} onToggle={handleFeederToggle} />
          ))}
        </View>
      </View>

      {/* Other Devices Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Thiết bị khác</Text>
          <ButtonControlSwitch
            onSwitchToManual={() => console.log('Others to Manual')}
            onSwitchToSchedule={() => console.log('Others to Schedule')}
          />
        </View>
        <View style={styles.gridContainer}>
          {otherDevices.map(device => (
            <View key={device.id} style={styles.gridItem}>
              <DeviceCard data={device} onToggle={handleOtherToggle} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4, // Align visually
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardWrapper: {
    // Just single item full width usually
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6, // Negative margin for grid gap compensation
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
});
