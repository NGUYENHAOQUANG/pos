import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/styles';

interface CycleCardProps {
  cycleName: string;
  startDate: string;
  doc: number;
  stockingQuantity: number;
  breed: string;
  style?: StyleProp<ViewStyle>;
}

export const CycleCard: React.FC<CycleCardProps> = ({
  cycleName,
  startDate,
  doc,
  stockingQuantity,
  breed,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.cycleName}>{cycleName}</Text>
        <Text style={styles.dateText}>{startDate} - nay</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
          <Text style={styles.value}>{doc}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số lượng thả (Pls):</Text>
          <Text style={styles.value}>{stockingQuantity.toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tôm giống:</Text>
          <Text style={[styles.value, styles.breedValue]}>{breed}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDark,
    ...shadows.sm,
  },
  header: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  body: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    alignItems: 'flex-start', // Align start to handle multi-line value like breed
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1, // Allow label to take space but usually it's fixed width or ratio
  },
  value: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    flex: 1, // Value takes remaining space
    paddingLeft: spacing.sm,
  },
  breedValue: {
    color: colors.text, // Normal text color or maybe darker
  },
});
