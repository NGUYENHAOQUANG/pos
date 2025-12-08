import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeadingDevices } from '../components/HeadingDevices';
import { ButtonHelp } from '../components/ButtonHelp';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';
import { colors } from '@/styles';

import { useState } from 'react';
import { DevicesInPondScreens } from './devices/DeviceInPondScreens';

export const DeviceControlScreens = () => {
  const [selectedPond, setSelectedPond] = useState<string | null>(null);

  if (selectedPond) {
    return <DevicesInPondScreens onBack={() => setSelectedPond(null)} />;
  }

  return (
    <View style={styles.container}>
      <HeadingDevices
        title="Điều Khiển Thiết Bị"
        rightComponent={<ButtonHelp />}
        showBackButton={false}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <DevicesStatus totalPonds={2} activePonds={2} warningPonds={1} otherPonds={0} />
        <View style={styles.spacer} />
        <PondCard pondName="Ao 1" onPressDetail={() => setSelectedPond('Ao 1')} />
        <PondCard pondName="Ao 2" onPressDetail={() => setSelectedPond('Ao 2')} />
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
    paddingBottom: 20,
  },
  spacer: {
    height: 16,
  },
});
