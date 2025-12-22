import React from 'react';
import { View, Text, StyleSheet, TextInput, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { formatNumber } from '@/features/farm/utils/numberUtils';

interface CurrentPondInfoBoxProps {
  shrimpBreed?: string;
  actualStockingQuantity?: number;
  shrimpSize?: string;
  onShrimpSizeChange?: (value: string) => void;
  totalEstimatedShrimp?: number;
  containerStyle?: ViewStyle;
}

export const CurrentPondInfoBox: React.FC<CurrentPondInfoBoxProps> = ({
  shrimpBreed,
  actualStockingQuantity,
  shrimpSize = '60',
  onShrimpSizeChange,
  totalEstimatedShrimp,
  containerStyle,
}) => {
  // Calculate total estimated shrimp if not provided
  // Formula: (actualStockingQuantity * 1000) / shrimpSize
  const calculatedTotal =
    totalEstimatedShrimp !== undefined
      ? totalEstimatedShrimp
      : actualStockingQuantity && shrimpSize && parseFloat(shrimpSize) > 0
      ? Math.round((actualStockingQuantity * 1000) / parseFloat(shrimpSize))
      : 0;

  return (
    <SelectionInfoBox title="Thông tin ao hiện tại" style={containerStyle}>
      {/* Shrimp Stock Details */}
      {(shrimpBreed || actualStockingQuantity !== undefined) && (
        <View style={styles.infoSectionContainer}>
          {shrimpBreed && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Tôm giống:</Text>
              <Text style={styles.infoValue}>{shrimpBreed}</Text>
            </View>
          )}
          {actualStockingQuantity !== undefined && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Số lượng thả thực tế:</Text>
              <Text style={styles.infoValue}>{formatNumber(actualStockingQuantity)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Shrimp Size Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>* </Text>
          Cỡ tôm (con/kg)
        </Text>
        <TextInput
          style={styles.input}
          value={shrimpSize}
          onChangeText={onShrimpSizeChange}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>

      {/* Total Estimated Shrimp Count */}
      <View style={styles.resultSectionContainer}>
        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>Tổng số tôm dự kiến (con)</Text>
          <Text style={styles.resultValue}>{formatNumber(calculatedTotal)}</Text>
        </View>
        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập
        </Text>
      </View>
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
  infoSectionContainer: {
    gap: spacing.xs,
  },
  infoSection: {
    flexDirection: 'row',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
    marginRight: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text,
    flex: 1,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  required: {
    color: colors.error,
  },
  input: {
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: colors.text,
  },
  resultSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.neutral,
    borderRadius: borderRadius.sm,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  resultSectionContainer: {
    gap: spacing.xs,
  },
  disclaimer: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 14,
  },
});
