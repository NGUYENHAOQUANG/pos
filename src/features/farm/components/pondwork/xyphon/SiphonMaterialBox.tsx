import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

interface SiphonMaterialBoxProps {
  onAddMaterial: () => void;
}

export const SiphonMaterialBox: React.FC<SiphonMaterialBoxProps> = ({ onAddMaterial }) => {
  return (
    <SelectionInfoBox
      title={
        <Text style={styles.title}>
          <Text style={styles.required}>* </Text>
          Chọn vật tư
        </Text>
      }
    >
      <TouchableOpacity style={styles.addButton} onPress={onAddMaterial} activeOpacity={0.8}>
        <Ionicons name="add" size={16} color={colors.primary} />
        <Text style={styles.addButtonText}>Thêm vật tư</Text>
      </TouchableOpacity>
    </SelectionInfoBox>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    height: 32,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    lineHeight: 22,
  },
});
