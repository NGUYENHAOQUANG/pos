import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { ShrimpInspectionInfoBox } from '@/features/farm/components/shrimp-inspection/ShrimpInspectionInfoBox';

interface ShrimpInspectionNotesBoxProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export const ShrimpInspectionNotesBox: React.FC<ShrimpInspectionNotesBoxProps> = ({
  notes,
  onNotesChange,
}) => {
  return (
    <ShrimpInspectionInfoBox title="Ghi chú">
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
    </ShrimpInspectionInfoBox>
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
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
