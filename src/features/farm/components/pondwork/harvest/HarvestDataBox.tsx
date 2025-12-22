import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { formatNumber } from '@/features/farm/utils/numberUtils';

interface HarvestDataBoxProps {
  yieldAmount?: string; // Sản lượng (kg)
  onYieldAmountChange?: (value: string) => void;
  shrimpSize?: string; // Cỡ tôm (con/kg)
  onShrimpSizeChange?: (value: string) => void;
  referencePrice?: string; // Giá tôm tham khảo (VNĐ/kg)
  onReferencePriceChange?: (value: string) => void;
  containerStyle?: ViewStyle;
}

export const HarvestDataBox: React.FC<HarvestDataBoxProps> = ({
  yieldAmount = '',
  onYieldAmountChange,
  shrimpSize = '',
  onShrimpSizeChange,
  referencePrice = '',
  onReferencePriceChange,
  containerStyle,
}) => {
  // Calculate revenue: yieldAmount * referencePrice
  const revenue = useMemo(() => {
    const yieldValue = parseFloat(yieldAmount.replace(/\D/g, '')) || 0;
    const price = parseFloat(referencePrice.replace(/\D/g, '')) || 0;
    if (yieldValue > 0 && price > 0) {
      return yieldValue * price;
    }
    return null;
  }, [yieldAmount, referencePrice]);

  // Format number with dots as thousand separators
  const formatNumberDisplay = (num: number | null): string => {
    if (num === null) return '-';
    return formatNumber(num) || '-';
  };

  return (
    <SelectionInfoBox title="Số liệu thu hoạch" style={containerStyle}>
      {/* First Row: Sản lượng và Cỡ tôm */}
      <View style={styles.row}>
        {/* Sản lượng (kg) */}
        <View style={[styles.col, { paddingRight: spacing.xs }]}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>
            Sản lượng (kg)
          </Text>
          <TextInput
            style={styles.input}
            value={yieldAmount}
            onChangeText={onYieldAmountChange}
            keyboardType="numeric"
            placeholder="Input"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Cỡ tôm (con/kg) */}
        <View style={[styles.col, { paddingLeft: spacing.xs }]}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>
            Cỡ tôm (con/kg)
          </Text>
          <TextInput
            style={styles.input}
            value={shrimpSize}
            onChangeText={onShrimpSizeChange}
            keyboardType="numeric"
            placeholder="Input"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Second Row: Giá tôm tham khảo */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>* </Text>
          Giá tôm tham khảo (VNĐ/kg)
        </Text>
        <TextInput
          style={styles.input}
          value={referencePrice}
          onChangeText={onReferencePriceChange}
          keyboardType="numeric"
          placeholder="Input"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Calculated Revenue */}
      <View style={styles.resultSectionContainer}>
        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>Doanh thu (VNĐ)</Text>
          <Text style={styles.resultValue}>{formatNumberDisplay(revenue)}</Text>
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
  inputGroup: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
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
    height: 44,
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
