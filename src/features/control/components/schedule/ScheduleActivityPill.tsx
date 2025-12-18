import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles';

interface ScheduleActivityPillProps {
  isActive: boolean;
  isPrevActive: boolean;
  isNextActive: boolean;
  color?: string;
}

export const ScheduleActivityPill: React.FC<ScheduleActivityPillProps> = ({
  isActive,
  isPrevActive,
  isNextActive,
  color = colors.primary,
}) => {
  if (!isActive) return null;

  const indicatorStyle = {
    borderTopLeftRadius: isPrevActive ? 0 : 16,
    borderTopRightRadius: isPrevActive ? 0 : 16,
    borderBottomLeftRadius: isNextActive ? 0 : 16,
    borderBottomRightRadius: isNextActive ? 0 : 16,
    // Remove gaps so they touch the grid lines/boundaries
    marginTop: 0,
    marginBottom: 0,
    top: 0,
    bottom: 0,
  };

  return <View style={[styles.activeIndicator, indicatorStyle, { backgroundColor: color }]} />;
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -5,
    width: 10,
    // backgroundColor is set via props
  },
});
