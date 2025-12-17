// typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';

interface Props {
  label: string;
}

export const RequiredLabel: React.FC<Props> = ({ label }) => (
  <View style={styles.container}>
    <Text style={styles.required}>* </Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.sm },
  label: { fontSize: typography.fontSize.sm, color: colors.text },
  required: { fontSize: typography.fontSize.sm, color: colors.error, marginLeft: spacing.xs / 2 },
});