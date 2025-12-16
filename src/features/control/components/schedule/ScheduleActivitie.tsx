import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';
import { ScheduleDescriptionTab } from './ScheduleDescriptionTab';
import { ScheduleActivityPill } from './ScheduleActivityPill';
import { SvgProps } from 'react-native-svg';

import FanIcon from '@/assets/images/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/images/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/images/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/images/Icon/IconDevices/syphon.svg';

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon';

interface DeviceColumnData {
  type: DeviceType;
  count: number;
  color?: string;
}

interface ActivitySlot {
  startTime: string;
  endTime: string;
}

interface ScheduleActivitieProps {
  devices?: DeviceColumnData[];
  activities?: ActivitySlot[];
  currentTime?: string;
}

// Device icon mapping
const DEVICE_ICONS: Record<DeviceType, React.FC<SvgProps>> = {
  fan: FanIcon,
  feeder: FeederIcon,
  oxy: OxyIcon,
  syphon: SyphonIcon,
};

// Generate time slots from 00:00 to 24:00 with 15 min intervals
const generateTimeSlots = (): string[] => {
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

const DEFAULT_TIME_SLOTS = generateTimeSlots();

const DEFAULT_DEVICES: DeviceColumnData[] = [
  { type: 'feeder', count: 1 },
  { type: 'oxy', count: 1, color: colors.error },
  { type: 'oxy', count: 2 },
  { type: 'fan', count: 1 },
  { type: 'fan', count: 2 },
  { type: 'fan', count: 3, color: colors.text },
  { type: 'syphon', count: 1, color: colors.text },
];

const DEFAULT_ACTIVITIES: ActivitySlot[] = [
  { startTime: '00:00', endTime: '00:30' },
  { startTime: '00:45', endTime: '01:00' },
  { startTime: '01:30', endTime: '01:45' },
  { startTime: '02:15', endTime: '02:30' },
  { startTime: '03:00', endTime: '04:00' },
];

// Check if a time slot has activity
const hasActivity = (time: string, activities: ActivitySlot[]): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  return activities.some(activity => {
    const [startH, startM] = activity.startTime.split(':').map(Number);
    const [endH, endM] = activity.endTime.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;
    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  });
};

export const ScheduleActivitie: React.FC<ScheduleActivitieProps> = ({
  devices = DEFAULT_DEVICES,
  activities = DEFAULT_ACTIVITIES,
  currentTime = '01:00',
}) => {
  return (
    <View style={styles.container}>
      {/* Legend Component */}
      <ScheduleDescriptionTab type="schedule" />

      {/* Schedule table */}
      <View style={styles.tableContainer}>
        {/* Header with device icons */}
        <View style={styles.header}>
          <View style={styles.timeColumnHeader} />
          {devices.map((device, index) => {
            const iconColor = device.color || colors.primary;
            const Icon = DEVICE_ICONS[device.type];
            return (
              <View key={index} style={styles.deviceColumn}>
                <Icon width={32} height={32} color={iconColor} />
                <Text style={[styles.deviceCount, { color: iconColor }]}>{device.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Time slots with activities */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {DEFAULT_TIME_SLOTS.map((time, index) => {
            const isFullHour = time.endsWith(':00');
            const isCurrentTime = time === currentTime;

            // Current slot active?
            const showIndicator = hasActivity(time, activities);

            // Check neighbors for connectivity
            const prevTime = index > 0 ? DEFAULT_TIME_SLOTS[index - 1] : null;
            const nextTime =
              index < DEFAULT_TIME_SLOTS.length - 1 ? DEFAULT_TIME_SLOTS[index + 1] : null;

            const isPrevActive = prevTime ? hasActivity(prevTime, activities) : false;
            const isNextActive = nextTime ? hasActivity(nextTime, activities) : false;

            return (
              <View key={index} style={styles.timeRow}>
                {/* Time label column with tick */}
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, isFullHour && styles.timeTextBold]}>{time}</Text>
                  <View style={styles.timeTick} />
                </View>

                {/* Device columns (grid cells) */}
                {devices.map((device, deviceIndex) => (
                  <View key={deviceIndex} style={styles.gridCell}>
                    <View style={styles.horizontalLine} />
                    <View style={styles.dashedLine} />
                    {/* Render indicator if active and is feeder */}
                    {device.type === 'feeder' && (
                      <ScheduleActivityPill
                        isActive={showIndicator}
                        isPrevActive={isPrevActive}
                        isNextActive={isNextActive}
                      />
                    )}
                  </View>
                ))}

                {/* Current time line */}
                {isCurrentTime && <View style={styles.currentTimeLine} />}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'stretch', // Ensure vertical lines connect
  },
  timeColumnHeader: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
  },
  deviceColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    paddingBottom: spacing.sm,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  deviceCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
  },
  timeColumn: {
    width: 40,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeTick: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 6,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  timeTextBold: {
    fontWeight: '600',
    color: colors.text,
  },
  gridCell: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    position: 'relative',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: colors.gray[100],
    zIndex: -1,
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
    zIndex: -1,
  },

  currentTimeLine: {
    position: 'absolute',
    left: 40,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: colors.error,
    zIndex: 10,
  },
});
