import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';

interface DevicesItemProps {
  icon: ImageSourcePropType;
  activeCount?: number;
  warningCount?: number;
  inactiveCount?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const DevicesItem: React.FC<DevicesItemProps> = ({
  icon,
  activeCount = 0,
  warningCount = 0,
  inactiveCount = 0,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.mainIcon} resizeMode="contain" />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Ionicons name="power-outline" size={16} color={colors.status.totalText} />
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>

        <View style={styles.statRow}>
          <Ionicons name="warning-outline" size={16} color={colors.error} />
          <Text style={styles.statValue}>{warningCount}</Text>
        </View>

        <View style={styles.statRow}>
          <Ionicons name="ban-outline" size={16} color={colors.warning} />
          <Text style={styles.statValue}>{inactiveCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
    // Removed fixed minWidth to allow flex shrinking/growing
  },
  iconContainer: {
    marginBottom: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    width: 32,
    height: 32,
  },
  statsContainer: {
    gap: 4,
    alignItems: 'center',
    width: '100%',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginLeft: 4,
    minWidth: 16,
  },
});
