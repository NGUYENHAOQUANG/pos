import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface MetricCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
  containerStyle?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  valueColor,
  containerStyle,
}) => {
  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >
      <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8FD5FF',
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

