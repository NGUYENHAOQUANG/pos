import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ButtonControlMode } from './ButtonControlMode';
import { ButtonDevices } from './ButtonDevices';
import { EControlMode } from '../../types/control.types';
import { colors } from '@/styles';

export interface DeviceData {
  id: string;
  name: string;
  icon: ImageSourcePropType;
  mode: EControlMode;
  isOn: boolean;
  errorMessage?: string;
}

export interface DeviceCardProps {
  data: DeviceData;
  onToggle: (id: string, val: boolean) => void;
  onSettingsPress?: (id: string) => void;
  onModePress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  data,
  onToggle,
  onSettingsPress,
  onModePress,
  style,
}) => {
  // Determine styles based on state
  let containerStyle: ViewStyle = styles.cardContainer;
  let iconColor: string = colors.primary; // Default Blue
  let switchTrackColor: string = colors.primary;

  if (data.errorMessage) {
    // Error State
    containerStyle = { ...styles.cardContainer, ...styles.cardError };
    iconColor = colors.error;
    switchTrackColor = colors.primary;
  } else if (!data.isOn) {
    // Inactive State
    containerStyle = { ...styles.cardContainer, ...styles.cardInactive };
    iconColor = colors.gray[500];
    switchTrackColor = colors.gray[200];
  } else {
    // Active State
    containerStyle = { ...styles.cardContainer, ...styles.cardActive };
  }

  return (
    <View style={[containerStyle, style]}>
      {/* Left Content: Icon & Name */}
      <View style={styles.leftContent}>
        <Image
          source={data.icon}
          style={[styles.icon, { tintColor: iconColor }]}
          resizeMode="contain"
        />
        <View style={styles.infoContainer}>
          {data.errorMessage && <Text style={styles.errorText}>{data.errorMessage}</Text>}
          <Text style={styles.deviceName}>{data.name}</Text>
        </View>
      </View>

      {/* Right Controls: Absolute Positioned */}

      {/* Right Controls Container */}
      <View style={styles.rightControlContainer}>
        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => onSettingsPress?.(data.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={18} color={colors.gray[600]} />
        </TouchableOpacity>

        <ButtonControlMode
          mode={data.mode}
          onPress={() => onModePress?.(data.id)}
          style={styles.modeButton}
        />
        <ButtonDevices
          value={data.isOn}
          onValueChange={val => onToggle(data.id, val)}
          trackColor={switchTrackColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%', // Fill the grid wrapper
    aspectRatio: 164 / 124, // Maintain shape
    position: 'relative', // Context for absolute positioning
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  cardInactive: {
    borderColor: colors.border, // Light visible border
    backgroundColor: colors.gray[50],
  },
  cardError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2', // Light red background
  },
  leftContent: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 60, // Avoid overlap with absolute right items
  },
  icon: {
    width: 48,
    height: 48,
  },
  infoContainer: {
    justifyContent: 'flex-end',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
    marginBottom: 2,
  },
  // Absolute Positions
  // Right Control Container
  rightControlContainer: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    right: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align all items to the right edge
    zIndex: 1,
    width: 66,
  },
  modeButton: {
    // marginBottom removed as space-between handles it
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
