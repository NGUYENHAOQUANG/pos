import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TouchableHighlight,
} from 'react-native';
import { HeaderDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { colors, spacing, borderRadius } from '@/styles';
import CustomFeedingMachine from '../CustomFeedingMachine/CustomFeedingMachineScreen';
import { EControlMode, DeviceData } from '../../types/control.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '../../navigation/ControlNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useControl } from '../../context/ControlContext';

// Removed Mocks

interface DevicesInPondScreensProps {
  // onBack?: () => void;
  // pondName?: string;
}

type ViewMode = 'list' | 'customFeeding';

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
  const route = useRoute<RouteProp<ControlStackParamList, 'ControlDetail'>>();
  const { pondName = 'Ao 1' } = route.params || {};

  const { ponds, toggleDevice } = useControl();
  const currentPond = ponds.find(p => p.name === pondName);
  const allDevices = currentPond?.devices || [];

  const feeders: DeviceData[] = allDevices.filter(d => d.type === 'feeder');
  const otherDevices: DeviceData[] = allDevices.filter(d => d.type !== 'feeder');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Show Custom Feeding Machine Screen
  if (viewMode === 'customFeeding') {
    const selectedDevice = allDevices.find(d => d.id === selectedDeviceId);
    const initialMode = selectedDevice?.mode === EControlMode.SCHEDULE ? 'schedule' : 'manual';

    return (
      <CustomFeedingMachine
        initialMode={initialMode}
        onBack={() => {
          setViewMode('list');
          setSelectedDeviceId(null);
        }}
        onSave={newMode => {
          // Note: In a real app we'd update context here
          console.log('Mode updated:', newMode);
          setViewMode('list');
          setSelectedDeviceId(null);
        }}
      />
    );
  }

  const handleSettingsPress = (id: string) => {
    setSelectedDeviceId(id);
    setViewMode('customFeeding');
  };

  const handleToggleDevice = (id: string, isOn: boolean) => {
    if (currentPond) {
      toggleDevice(currentPond.id, id, isOn);
    }
  };

  const renderRightHeader = () => (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity
        style={[styles.addButton, showAddPopup && styles.addButtonActive]}
        onPress={() => setShowAddPopup(!showAddPopup)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>

      {showAddPopup && (
        <View style={styles.popupContainer}>
          <TouchableHighlight
            style={styles.popupItem}
            underlayColor={colors.gray[100]}
            onPress={() => {
              setShowAddPopup(false);
              navigation.navigate('ConnectDevice', { pondName });
            }}
          >
            <Text style={styles.popupText}>Thêm thiết bị</Text>
          </TouchableHighlight>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderDevices
        title={`Thiết Bị - ${pondName}`}
        onBackPress={() => navigation.goBack()}
        rightComponent={renderRightHeader()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* History Buttons Section */}
        <View style={styles.historySection}>
          <ButtonHistory
            onSchedulePress={() => navigation.navigate('Schedule', { pondName })}
            onStatisticPress={() => navigation.navigate('History', { pondName })}
            style={styles.historyButton}
          />
        </View>

        {/* Feeder Section */}
        <DevicesCard
          title="Máy cho ăn"
          devices={feeders}
          layout="grid"
          onSettingsPress={handleSettingsPress}
          onSwitchToSchedule={() => {}}
          onSwitchToManual={() => {}}
          onToggle={handleToggleDevice}
          style={styles.extendedCard}
        />

        {/* Other Devices Section */}
        <DevicesCard
          title="Thiết bị khác"
          devices={otherDevices}
          layout="grid"
          onSettingsPress={handleSettingsPress}
          onSwitchToSchedule={() => {}}
          onSwitchToManual={() => {}}
          onToggle={handleToggleDevice}
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
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
  },
  historyButton: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  extendedCard: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerRightContainer: {
    zIndex: 1001,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  addButtonActive: {
    borderColor: colors.primary,
  },
  popupContainer: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
    zIndex: 1002,
  },
  popupItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  popupText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400',
  },
});
