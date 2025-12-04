import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '@/styles';

interface DropdownVoteStatusProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  placeholder?: string;
  dropdownStyle?: ViewStyle;
}

export const DropdownVoteStatus: React.FC<DropdownVoteStatusProps> = ({
  value,
  onChange,
  options = ['Hoàn thành', 'Lưu nháp'],
  placeholder = 'Trạng thái',
  dropdownStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, !value && styles.placeholderText]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#999'} />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdown, dropdownStyle]}>
          {options.map((option, index) => {
            const isSelected = option === value;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => handleSelect(option)}
              >
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 20,
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    fontFamily: typography.fontFamily.regular,
  },
  placeholderText: {
    color: colors.textSecondary || '#999',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing['2xl'],
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },
  item: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  itemSelected: {
    backgroundColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 14,
    color: colors.text,
  },
  itemTextSelected: {
    fontWeight: '500',
    color: colors.text,
  },
});
