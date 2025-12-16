import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';

interface ShrimpInspectionInfoBoxProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ShrimpInspectionInfoBox: React.FC<ShrimpInspectionInfoBoxProps> = ({
  title,
  children,
  style,
}) => {
  return (
    <View style={[styles.infoBox, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    paddingVertical: spacing.md,
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
