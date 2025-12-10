import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';

interface TimeProps {
  startTime?: string;
  endTime?: string;
}

export const Time: React.FC<TimeProps> = ({ startTime = '00:00', endTime = '00:00' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{startTime}</Text>
      <Text style={styles.timeText}>{endTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
});
