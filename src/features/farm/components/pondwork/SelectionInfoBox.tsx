import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';

interface SelectionInfoBoxProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SelectionInfoBox: React.FC<SelectionInfoBoxProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.infoBox, style]}>
      {typeof title === 'string' ? (
        <Text style={styles.sectionTitle}>{title}</Text>
      ) : (
        <View style={styles.titleContainer}>{title}</View>
      )}
      <View style={styles.divider} />
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    paddingVertical: spacing.md,
  },
  titleContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 12,
    marginHorizontal: -spacing.md,
  },
  childrenContainer: {
    gap: spacing.md,
  },
});
