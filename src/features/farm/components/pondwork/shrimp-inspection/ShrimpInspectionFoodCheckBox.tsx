import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface ShrimpInspectionFoodCheckBoxProps {
  foodAmount: string;
  onFoodAmountChange: (value: string) => void;
  leftoverFood: string;
  onLeftoverFoodChange: (value: string) => void;
}

const leftoverFoodOptions = ['Hết', 'Còn 5–10%', 'Còn 10–15%', 'Còn 15–20%'];

const renderRadioGroup = (options: string[], selected: string, onSelect: (val: string) => void) => (
  <View style={styles.radioGroup}>
    {options.map(option => (
      <TouchableOpacity
        key={option}
        style={styles.radioItem}
        onPress={() => onSelect(option)}
        activeOpacity={0.8}
      >
        <View style={[styles.radioOuter, selected === option && styles.radioOuterSelected]}>
          {selected === option && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const ShrimpInspectionFoodCheckBox: React.FC<ShrimpInspectionFoodCheckBoxProps> = ({
  foodAmount,
  onFoodAmountChange,
  leftoverFood,
  onLeftoverFoodChange,
}) => {
  return (
    <SelectionInfoBox title="Kiểm tra thức ăn">
      {/* Lượng thức ăn cho vào nhá */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>* </Text>
          Lượng thức ăn cho vào nhá (g)
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Input"
          placeholderTextColor="#00000040"
          value={foodAmount}
          onChangeText={onFoodAmountChange}
          keyboardType="numeric"
        />
      </View>

      {/* Thức ăn thừa */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Thức ăn thừa</Text>
        {renderRadioGroup(leftoverFoodOptions, leftoverFood, onLeftoverFoodChange)}
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
    color: colors.error || '#FF4D4F',
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
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    height: 22,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
    lineHeight: 22,
  },
});
