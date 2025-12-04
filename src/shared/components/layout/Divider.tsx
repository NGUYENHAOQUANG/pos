import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';

interface DividerProps {
  text?: string;
  textColor?: string;
  lineColor?: string;
}

export function Divider({
  text,
  textColor = colors.textSecondary,
  lineColor = colors.border,
}: DividerProps) {
  if (!text) {
    return <View style={[styles.line, { backgroundColor: lineColor }]} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.line, styles.lineFlex, { backgroundColor: lineColor }]} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      <View style={[styles.line, styles.lineFlex, { backgroundColor: lineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  lineFlex: {
    flex: 1,
  },
});
