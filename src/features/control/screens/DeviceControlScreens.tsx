import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeaderDevices } from '../components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '../components/HeaderCamLocation';
import { ButtonHelp } from '../components/ButtonHelp';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';
import { colors } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
// Define pond count for each farm
const FARM_POND_CONFIG: Record<string, number> = {
  '1': 2,
  '2': 3,
  '3': 4,
  '4': 5,
};

export const DeviceControlScreens = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
  const [selectedFarm, setSelectedFarm] = useState<FarmLocation>({
    id: '1',
    name: 'Trại Kiên Giang',
  });

  // Get pond count based on selected farm
  const pondCount = FARM_POND_CONFIG[selectedFarm.id] || 2;

  // Render pond cards list
  const renderPondCards = () => {
    const cards = [];
    for (let i = 1; i <= pondCount; i++) {
      cards.push(
        <PondCard
          key={i}
          pondName={`Ao ${i}`}
          onPressDetail={() => navigation.navigate('ControlDetail', { pondName: `Ao ${i}` })}
        />
      );
    }
    return cards;
  };

  return (
    <View style={styles.container}>
      <HeaderCamLocation onLocationSelect={setSelectedFarm} />
      <HeaderDevices
        title="Điều Khiển Thiết Bị"
        rightComponent={<ButtonHelp />}
        showBackButton={false}
        includeSafeArea={false}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <DevicesStatus
          totalPonds={pondCount}
          activePonds={pondCount}
          warningPonds={Math.min(1, pondCount)}
          otherPonds={0}
        />
        <View style={styles.spacer} />
        {renderPondCards()}
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
