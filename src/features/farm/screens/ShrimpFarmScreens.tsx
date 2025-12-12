import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { HeaderFarm } from '../components/HeaderFarm';
import { HeadingFarm, FarmTabType } from '../components/HeadingFarm';
import { ShrimpPondListScreens } from './pond/ShrimpPondListScreens';

export const ShrimpFarmScreens = () => {
  const [selectedTab, setSelectedTab] = useState<FarmTabType>('all');

  return (
    <View style={styles.container}>
      <HeaderFarm onSelect={() => {}} onMenuPress={() => {}} />

      <HeadingFarm
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
        counts={{
          all: 5,
          active: 0,
          preparing: 3,
        }}
      />

      <View style={styles.content}>
        <ShrimpPondListScreens />
      </View>
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
});
