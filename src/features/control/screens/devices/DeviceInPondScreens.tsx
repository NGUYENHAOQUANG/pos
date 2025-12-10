import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeadingDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { ScheduleActivitieScreens } from '../schedule/ScheduleActivitieScreens';
import { HistoryActivitieScreens } from '../schedule/HistoryActivitieScreens';
import { colors, spacing } from '@/styles';

interface DevicesInPondScreensProps {
  onBack?: () => void;
  pondName?: string;
}

type ViewMode = 'list' | 'schedule' | 'history';

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = ({
  onBack,
  pondName = 'Ao 1',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Show schedule screen
  if (viewMode === 'schedule') {
    return <ScheduleActivitieScreens pondName={pondName} onBack={() => setViewMode('list')} />;
  }

  // Show history screen
  if (viewMode === 'history') {
    return <HistoryActivitieScreens pondName={pondName} onBack={() => setViewMode('list')} />;
  }

  return (
    <View style={styles.container}>
      <HeadingDevices title={`Thiết Bị - ${pondName}`} onBackPress={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* History Buttons Section */}
        <View style={styles.historySection}>
          <ButtonHistory
            onSchedulePress={() => setViewMode('schedule')}
            onStatisticPress={() => setViewMode('history')}
            style={styles.historyButton}
          />
        </View>

        {/* Feeder Section */}
        <DevicesCard
          title="Máy cho ăn"
          type="feeder"
          layout="grid"
          onSettingsPress={id => console.log('Settings Feeder', id)}
          onSwitchToSchedule={() => console.log('Feeder Schedule')}
          onSwitchToManual={() => console.log('Feeder Manual')}
          style={styles.extendedCard}
        />

        {/* Other Devices Section */}
        <DevicesCard
          title="Thiết bị khác"
          type="other"
          layout="grid"
          onSettingsPress={id => console.log('Settings Device', id)}
          onSwitchToSchedule={() => console.log('Other Schedule')}
          onSwitchToManual={() => console.log('Other Manual')}
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
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
  },
  historyButton: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  extendedCard: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md + 16,
  },
});
