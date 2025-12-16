import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SvgProps } from 'react-native-svg';

import FanIcon from '@/assets/images/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/images/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/images/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/images/Icon/IconDevices/syphon.svg';

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon';
type DeviceStatus = 'default' | 'active' | 'warning';

interface DeviceColumn {
  type: DeviceType;
  count: number;
  status?: DeviceStatus;
}

interface ColumnProps {
  devices?: DeviceColumn[];
  timeSlots?: string[];
}

// Device icon mapping
const DEVICE_ICONS: Record<DeviceType, React.FC<SvgProps>> = {
  fan: FanIcon,
  feeder: FeederIcon,
  oxy: OxyIcon,
  syphon: SyphonIcon,
};

// Status color mapping
const STATUS_COLORS: Record<DeviceStatus, string> = {
  default: colors.text,
  active: colors.primary,
  warning: colors.error,
};

// Generate default time slots from 00:00 to 24:00 with 15 min intervals
const generateDefaultTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const DEFAULT_TIME_SLOTS = generateDefaultTimeSlots();

const DEFAULT_DEVICES: DeviceColumn[] = [
  { type: 'feeder', count: 1, status: 'default' },
  { type: 'feeder', count: 1, status: 'active' },
  { type: 'feeder', count: 1, status: 'warning' },
];

export const Column: React.FC<ColumnProps> = ({
  devices = DEFAULT_DEVICES,
  timeSlots = DEFAULT_TIME_SLOTS,
}) => {
  return (
    <View style={styles.container}>
      {/* Header with device icons */}
      <View style={styles.header}>
        <View style={styles.timeColumnHeader} />
        {devices.map((device, index) => {
          const status = device.status || 'default';
          const iconColor = STATUS_COLORS[status];
          const Icon = DEVICE_ICONS[device.type];
          return (
            <View key={index} style={styles.deviceColumn}>
              <Icon width={24} height={24} color={iconColor} />
              <Text style={[styles.deviceCount, { color: iconColor }]}>{device.count}</Text>
            </View>
          );
        })}
      </View>

      {/* Time slots */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {timeSlots.map((time, index) => {
          // Bold style for full hours (00, 01, 02, ...)
          const isFullHour = time.endsWith(':00');
          return (
            <View key={index} style={styles.timeRow}>
              <Text style={[styles.timeText, isFullHour && styles.timeTextBold]}>{time}</Text>
              {devices.map((_, deviceIndex) => (
                <View key={deviceIndex} style={styles.scheduleCell}>
                  {/* Inner dashed line */}
                  <View style={styles.dashedLine} />
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeColumnHeader: {
    width: 50,
  },
  deviceColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  deviceCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  scrollContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    borderStyle: 'solid',
  },
  timeText: {
    width: 50,
    fontSize: 12,
    color: colors.textSecondary,
    paddingLeft: 4,
  },
  timeTextBold: {
    fontWeight: '600',
    color: colors.text,
  },
  scheduleCell: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    borderStyle: 'solid',
    position: 'relative',
  },
  dashedLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[200],
    borderStyle: 'dashed',
  },
});
