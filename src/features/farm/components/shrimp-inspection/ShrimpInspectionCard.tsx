import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { ShrimpInspectionData } from '@/features/farm/types/shrimp-inspection.types';

interface ShrimpInspectionCardProps {
  inspection: ShrimpInspectionData;
}

export const ShrimpInspectionCard: React.FC<ShrimpInspectionCardProps> = ({ inspection }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Shrimp Inspection Card</Text>
      <Text style={styles.text}>Pond ID: {inspection.pondId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
