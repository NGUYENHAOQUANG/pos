import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, sizes } from '@/styles';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  activeColor?: string;
  inactiveColor?: string;
}

export function PageIndicator({
  totalPages,
  currentPage,
  activeColor = colors.primary,
  inactiveColor = colors.border,
}: PageIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentPage ? activeColor : inactiveColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: sizes.indicator,
    height: sizes.indicator,
    borderRadius: sizes.indicator / 2,
    backgroundColor: colors.border,
  },
});
