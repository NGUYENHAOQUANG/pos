import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeadingDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { colors, spacing } from '@/styles';

interface DevicesInPondScreensProps {
  onBack?: () => void;
}

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <HeadingDevices title="Thiết Bị - Ao 1" onBackPress={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* History Buttons Section */}
        <View style={styles.historySection}>
          <ButtonHistory
            onSchedulePress={() => console.log('Press Schedule')}
            onStatisticPress={() => console.log('Press Statistic')}
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
    paddingHorizontal: spacing.md + 16, // 16 is original padding, spacing.md compensates margin
  },
});
