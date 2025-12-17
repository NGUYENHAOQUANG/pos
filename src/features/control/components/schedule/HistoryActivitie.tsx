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

// Control mode types for background colors
type ControlMode = 'remote' | 'schedule' | 'local';

interface ActivitySlot {
  startTime: string;
  endTime: string;
}

interface DeviceColumnData {
  type: DeviceType;
  count: number;
  mode: ControlMode; // Base mode, but we might override with time-based logic
  color?: string;
  activities?: ActivitySlot[]; // Per-device activities
}

interface HistoryActivitieProps {
  devices?: DeviceColumnData[];
  activities?: ActivitySlot[]; // Kept for compatibility but might be unused if devices have their own
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

// Specific activities matching the image
const FEEDER_ACTIVITIES: ActivitySlot[] = [
  { startTime: '00:00', endTime: '00:15' },
  { startTime: '00:30', endTime: '00:45' },
  { startTime: '01:30', endTime: '01:45' },
  { startTime: '02:15', endTime: '02:30' },
  { startTime: '03:00', endTime: '03:15' },
  { startTime: '03:45', endTime: '04:00' },
  // Additional pills
  { startTime: '04:30', endTime: '04:45' },
  { startTime: '06:00', endTime: '06:15' },
  { startTime: '07:30', endTime: '07:45' },
  { startTime: '09:00', endTime: '09:15' },
  { startTime: '12:00', endTime: '12:15' },
  { startTime: '16:00', endTime: '16:15' },
  { startTime: '18:30', endTime: '18:45' },
];

const OXY1_ACTIVITIES: ActivitySlot[] = [
  { startTime: '00:45', endTime: '03:00' },
  { startTime: '03:00', endTime: '05:15' },
  // Additional pills
  { startTime: '08:00', endTime: '11:00' },
  { startTime: '13:00', endTime: '17:00' },
  { startTime: '19:00', endTime: '23:00' },
];

const FAN_ACTIVITIES: ActivitySlot[] = [
  { startTime: '00:00', endTime: '03:00' },
  { startTime: '03:00', endTime: '03:45' },
  // Additional pills
  { startTime: '06:00', endTime: '09:00' },
  { startTime: '10:00', endTime: '14:30' },
  { startTime: '18:00', endTime: '22:00' },
];

const FAN2_ACTIVITIES: ActivitySlot[] = [
  { startTime: '04:00', endTime: '06:00' },
  { startTime: '00:00', endTime: '03:00' },
  { startTime: '03:00', endTime: '03:45' },
  // Additional pills
  { startTime: '07:00', endTime: '10:00' },
  { startTime: '12:00', endTime: '15:00' },
  { startTime: '20:00', endTime: '23:45' },
];

const DEFAULT_DEVICES: DeviceColumnData[] = [
  {
    type: 'feeder',
    count: 1,
    mode: 'remote',
    activities: FEEDER_ACTIVITIES,
  },
  {
    type: 'oxy',
    count: 1,
    mode: 'remote',
    color: colors.error,
    activities: OXY1_ACTIVITIES,
  },
  {
    type: 'oxy',
    count: 2,
    mode: 'schedule',
    activities: [], // Empty
  },
  {
    type: 'fan',
    count: 1,
    mode: 'schedule',
    activities: FAN_ACTIVITIES,
  },
  {
    type: 'fan',
    count: 2,
    mode: 'local',
    activities: FAN2_ACTIVITIES,
  },
  {
    type: 'fan',
    count: 3,
    mode: 'local',
    color: colors.text,
    activities: [],
  },
  {
    type: 'syphon',
    count: 1,
    mode: 'local',
    color: colors.text,
    activities: [],
  },
];

// Check if a time slot has activity
const hasActivity = (time: string, activities: ActivitySlot[] = []): boolean => {
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

// Helper to get background color based on device and time
const getBackgroundColor = (device: DeviceColumnData, time: string): string => {
  // Feeder always remote (Blue)
  if (device.type === 'feeder') {
    return colors.schedule.remote;
  }

  // Parse time
  const [hours] = time.split(':').map(Number);

  // Logic: < 03:00 is Schedule (Yellow), >= 03:00 is Local (Green)
  // This matches the image where the color shift happens at 03:00
  if (hours < 3) {
    return colors.schedule.schedule;
  } else {
    return colors.schedule.local;
  }
};

export const HistoryActivitie: React.FC<HistoryActivitieProps> = ({
  devices = DEFAULT_DEVICES,
}) => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  return (
    <View style={styles.container}>
      {/* Legend Component */}
      <ScheduleDescriptionTab type="history" />

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

            // Check if this slot contains the current time
            const [slotHour, slotMinute] = time.split(':').map(Number);
            const slotTotalMinutes = slotHour * 60 + slotMinute;
            const isCurrentSlot =
              currentTotalMinutes >= slotTotalMinutes &&
              currentTotalMinutes < slotTotalMinutes + 15;

            // Calculate top offset: (minutes into slot / 15) * 20 (height)
            const minutesIntoSlot = currentTotalMinutes - slotTotalMinutes;
            const topOffset = (minutesIntoSlot / 15) * 20;

            return (
              <View key={index} style={styles.timeRow}>
                {/* Time label column with tick */}
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, isFullHour && styles.timeTextBold]}>{time}</Text>
                  <View style={styles.timeTick} />
                </View>

                {/* Device columns (grid cells) */}
                {devices.map((device, deviceIndex) => {
                  // Per-device activity logic
                  const deviceActivities = device.activities || [];
                  const showIndicator = hasActivity(time, deviceActivities);

                  // Dynamic background color
                  const backgroundColor = getBackgroundColor(device, time);

                  // Check neighbors for connectivity AND same background color
                  const prevTime = index > 0 ? DEFAULT_TIME_SLOTS[index - 1] : null;
                  const nextTime =
                    index < DEFAULT_TIME_SLOTS.length - 1 ? DEFAULT_TIME_SLOTS[index + 1] : null;

                  const prevBg = prevTime ? getBackgroundColor(device, prevTime) : null;
                  const nextBg = nextTime ? getBackgroundColor(device, nextTime) : null;

                  // Active if neighbors have activity AND same background color
                  const isPrevActive = prevTime
                    ? hasActivity(prevTime, deviceActivities) && prevBg === backgroundColor
                    : false;
                  const isNextActive = nextTime
                    ? hasActivity(nextTime, deviceActivities) && nextBg === backgroundColor
                    : false;

                  return (
                    <View key={deviceIndex} style={[styles.gridCell, { backgroundColor }]}>
                      <View style={styles.horizontalLine} />
                      <View style={styles.dashedLine} />

                      {/* Render indicator for ALL devices now */}
                      <ScheduleActivityPill
                        isActive={showIndicator}
                        isPrevActive={isPrevActive}
                        isNextActive={isNextActive}
                      />
                    </View>
                  );
                })}

                {/* Current time line - Absolute over the whole row if this is the current slot */}
                {isCurrentSlot && <View style={[styles.currentTimeLine, { top: topOffset }]} />}
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
