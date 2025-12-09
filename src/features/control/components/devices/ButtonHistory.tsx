import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

// Import PNG icons
const FieldTimeIcon = require('@/assets/images/Icon/IconDevices/FieldTimeOutlined.png');
const LineChartIcon = require('@/assets/images/Icon/IconDevices/LineChartOutlined.png');

interface ButtonHistoryProps {
  onSchedulePress?: () => void;
  onStatisticPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ButtonHistory: React.FC<ButtonHistoryProps> = ({
  onSchedulePress,
  onStatisticPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.scheduleButton} onPress={onSchedulePress} activeOpacity={0.7}>
        <Image source={FieldTimeIcon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>Lịch trình</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statisticButton}
        onPress={onStatisticPress}
        activeOpacity={0.7}
      >
        <Image source={LineChartIcon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>Lịch sử & Thống kê</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  scheduleButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  statisticButton: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
