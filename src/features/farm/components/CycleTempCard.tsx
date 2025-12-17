import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { CycleData } from '../../types/farm.types';

interface Props {
  data: Omit<CycleData, 'id'>;
  onPress: () => void;
}

export const CycleTempCard: React.FC<Props> = ({ data, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{data.seasonSource}</Text>
      <Text style={styles.sub}>Ngày thả</Text>

      <View style={styles.row}>
        <Text style={styles.text}>DOC: {data.age} ngày</Text>
        <Text style={styles.text}>{data.stockingQuantity} PLs</Text>
      </View>

      <Text style={styles.text}>Tôm giống: {data.breedSource}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  sub: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: { color: colors.text },
});
