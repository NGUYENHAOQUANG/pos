import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ButtonControlMode } from './ButtonControlMode';
import { ButtonDevices } from './ButtonDevices';
import { DevicesStatusColor } from './DevicesStatusColor';
import { DeviceData } from '../../types/control.types';
import { colors } from '@/styles/colors';
import { AutoScrollText } from './AutoScrollText';

// Responsive Scaling Helper
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375; // Standard design width (e.g., iPhone X/11/12/13/14 Pro)
const scaleFactor = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2); // Cap scaling to avoid excessive size on tablets

const s = (size: number) => Math.round(size * scaleFactor);

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
  let switchTrackColor: string = colors.primary;

  if (data.errorMessage) {
    // Error State
    containerStyle = { ...styles.cardContainer, ...styles.cardError };
    switchTrackColor = colors.primary;
  } else if (!data.isOn) {
    // Inactive State
    containerStyle = { ...styles.cardContainer, ...styles.cardInactive };
    switchTrackColor = colors.gray[200];
  } else {
    // Active State
    containerStyle = { ...styles.cardContainer, ...styles.cardActive };
  }

  const Icon = data.icon;

  if (!Icon) return null;

  return (
    <View style={[containerStyle, style]}>
      {/* Left Content: Icon & Name */}
      <View style={styles.leftContent}>
        <DevicesStatusColor
          icon={Icon}
          isOn={data.isOn}
          errorMessage={data.errorMessage}
          size={s(48)}
        />
        <View style={styles.infoContainer}>
          {data.errorMessage && <Text style={styles.errorText}>{data.errorMessage}</Text>}
          <AutoScrollText text={data.name} style={styles.deviceName} />
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
          <Ionicons name="settings-outline" size={s(18)} color={colors.gray[600]} />
        </TouchableOpacity>

        {/* Buttons with Scale Transform for small screens */}
        <ButtonControlMode
          mode={data.mode}
          onPress={() => onModePress?.(data.id)}
          style={styles.scaledButton}
        />
        <ButtonDevices
          value={data.isOn}
          onValueChange={val => onToggle(data.id, val)}
          trackColor={switchTrackColor}
          style={styles.scaledButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: s(16),
    padding: s(12),
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
    paddingRight: s(60), // Avoid overlap with absolute right items
  },
  icon: {
    width: s(48),
    height: s(48),
  },
  infoContainer: {
    justifyContent: 'flex-end',
  },
  deviceName: {
    fontSize: s(14),
    fontWeight: '400',
    color: colors.text,
  },
  errorText: {
    fontSize: s(13),
    color: colors.error,
    fontWeight: '500',
    marginBottom: 2,
  },
  // Absolute Positions
  // Right Control Container
  rightControlContainer: {
    position: 'absolute',
    top: s(12),
    bottom: s(12),
    right: s(12),
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align all items to the right edge
    zIndex: 1,
    width: s(66), // Scale the container width too
  },
  modeButton: {
    // marginBottom removed as space-between handles it
  },
  settingsButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaledButton: {
    transform: [{ scale: scaleFactor < 1 ? scaleFactor : 1 }],
  },
});
