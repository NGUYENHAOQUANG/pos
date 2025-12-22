import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SelectionNotesBoxProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export const SelectionNotesBox: React.FC<SelectionNotesBoxProps> = ({ notes, onNotesChange }) => {
  return (
    <SelectionInfoBox title="Ghi chú">
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.textArea}
          placeholder="Nhập ghi chú"
          placeholderTextColor="#00000040"
          value={notes}
          onChangeText={onNotesChange}
          multiline
          textAlignVertical="top"
        />
      </View>
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
