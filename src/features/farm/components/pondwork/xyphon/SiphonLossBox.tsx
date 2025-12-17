import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SiphonLossBoxProps {
  lossAmount: string;
  onLossAmountChange: (value: string) => void;
}

export const SiphonLossBox: React.FC<SiphonLossBoxProps> = ({ lossAmount, onLossAmountChange }) => {
  return (
    <SelectionInfoBox title="Hao hụt trong ao">
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>* </Text>
          Số tôm hao (kg)
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Input"
          placeholderTextColor={colors.borderSubtle}
          value={lossAmount}
          onChangeText={onLossAmountChange}
          keyboardType="numeric"
        />
      </View>
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
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
  textInput: {
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: colors.text,
  },
});
