import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/styles';

type IndicatorStatus = 'active' | 'idle' | 'warning' | 'success' | 'default';

interface IndicatorProps {
  status?: IndicatorStatus;
  style?: StyleProp<ViewStyle>;
}

// Color mapping for different statuses
const STATUS_COLORS: Record<IndicatorStatus, string> = {
  active: colors.primary,
  idle: colors.schedule.remote,
  warning: colors.schedule.schedule,
  success: colors.schedule.local,
  default: colors.gray[200],
};

export const Indicator: React.FC<IndicatorProps> = ({ status = 'active', style }) => {
  const backgroundColor = STATUS_COLORS[status] || STATUS_COLORS.default;

  return <View style={[styles.container, { backgroundColor }, style]} />;
};

const styles = StyleSheet.create({
  container: {
    width: 4,
    height: '100%',
    borderRadius: borderRadius.sm,
    minHeight: 40,
  },
});
