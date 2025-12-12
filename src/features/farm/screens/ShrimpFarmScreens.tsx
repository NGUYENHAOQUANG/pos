import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { HeaderFarm } from '../components/HeaderFarm';
import { HeadingFarm } from '../components/HeadingFarm';
import { ShrimpPondListScreens } from './pond/ShrimpPondListScreens';
import { PondWorkScreens } from './pond/PondWorkScreens';

import { FarmProvider } from '../context/FarmContext';

export const ShrimpFarmScreens = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [currentScreen, setCurrentScreen] = useState<'list' | 'pond_work'>('list');
  const [selectedPond, setSelectedPond] = useState<any>(null); // Replace 'any' with Pond type if available

  const handlePondPress = (pond: any) => {
    setSelectedPond(pond);
    setCurrentScreen('pond_work');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPond(null);
  };

  return (
    <FarmProvider>
      {currentScreen === 'pond_work' ? (
        <PondWorkScreens pond={selectedPond} onBack={handleBackToList} />
      ) : (
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
            <ShrimpPondListScreens onPondPress={handlePondPress} />
          </View>
        </View>
      )}
    </FarmProvider>
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
