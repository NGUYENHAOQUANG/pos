import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { StyledInput } from '@/features/farm/components/pondwork/measurement/StyledInput';
import { DataRow } from '@/features/farm/components/DataRow';
import { spacing, borderRadius } from '@/styles';

interface MeasurementDataBoxProps {
  shrimpSize: string;
  onShrimpSizeChange: (value: string) => void;
  remainingWeight: string;
  onRemainingWeightChange: (value: string) => void;
  initialShrimpCount?: number; // Optional initial count for survival rate calculation
}

export const MeasurementDataBox: React.FC<MeasurementDataBoxProps> = ({
  shrimpSize,
  onShrimpSizeChange,
  remainingWeight,
  onRemainingWeightChange,
  initialShrimpCount = 0,
}) => {
  const [totalShrimp, setTotalShrimp] = useState<number | null>(null);
  const [survivalRate, setSurvivalRate] = useState<number | null>(null);

  useEffect(() => {
    const size = parseFloat(shrimpSize);
    const weight = parseFloat(remainingWeight);

    if (!isNaN(size) && !isNaN(weight) && size > 0 && weight > 0) {
      const currentTotal = size * weight;
      setTotalShrimp(currentTotal);

      if (initialShrimpCount > 0) {
        const rate = (currentTotal / initialShrimpCount) * 100;
        setSurvivalRate(rate);
      } else {
        setSurvivalRate(null);
      }
    } else {
      setTotalShrimp(null);
      setSurvivalRate(null);
    }
  }, [shrimpSize, remainingWeight, initialShrimpCount]);

  return (
    <SelectionInfoBox title="Số liệu đo">
      <View style={styles.inputRow}>
        <StyledInput
          label="Cỡ tôm (con/kg)"
          value={shrimpSize}
          onChangeText={onShrimpSizeChange}
          keyboardType="numeric"
          placeholder="Input"
          required
        />
        <StyledInput
          label="Sản lượng còn lại (kg)"
          value={remainingWeight}
          onChangeText={onRemainingWeightChange}
          keyboardType="numeric"
          placeholder="Input"
          required
        />
      </View>
      <View style={styles.autoCalculatedBox}>
        <DataRow
          label="Tổng số tôm hiện tại (con)"
          value={totalShrimp !== null ? Math.round(totalShrimp).toLocaleString() : '-'}
        />
        <DataRow
          label="Tỉ lệ sống dự kiến (%)"
          value={survivalRate !== null ? survivalRate.toFixed(2) : '-'}
        />
      </View>
      <Text style={styles.noteText}>
        Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập
      </Text>
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  autoCalculatedBox: {
    backgroundColor: '#F7FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  noteText: {
    fontSize: 12,
    color: '#828282',
    marginTop: spacing.sm,
  },
});
