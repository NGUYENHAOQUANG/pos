import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface ShrimpInspectionObservationBoxProps {
  intestine: string;
  onIntestineChange: (value: string) => void;
  intestineColor: string;
  onIntestineColorChange: (value: string) => void;
  stoolColor: string;
  onStoolColorChange: (value: string) => void;
  liver: string;
  onLiverChange: (value: string) => void;
}

const intestineOptions = ['Đầy', 'Rỗng'];
const intestineColorOptions = ['Màu thức ăn', 'Màu đen', 'Bất thường'];
const stoolColorOptions = ['Màu thức ăn', 'Bất thường'];
const liverOptions = ['Bình thường', 'Bất thường'];

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

export const ShrimpInspectionObservationBox: React.FC<ShrimpInspectionObservationBoxProps> = ({
  intestine,
  onIntestineChange,
  intestineColor,
  onIntestineColorChange,
  stoolColor,
  onStoolColorChange,
  liver,
  onLiverChange,
}) => {
  return (
    <SelectionInfoBox title="Quan sát mẫu">
      {/* Đường ruột */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Đường ruột</Text>
        {renderRadioGroup(intestineOptions, intestine, onIntestineChange)}
      </View>

      {/* Màu đường ruột */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Màu đường ruột</Text>
        {renderRadioGroup(intestineColorOptions, intestineColor, onIntestineColorChange)}
      </View>

      {/* Màu phân */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Màu phân</Text>
        {renderRadioGroup(stoolColorOptions, stoolColor, onStoolColorChange)}
      </View>

      {/* Gan */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gan</Text>
        {renderRadioGroup(liverOptions, liver, onLiverChange)}
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
  },
});
