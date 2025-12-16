import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

interface UnitOfMeasureProps {
  label?: string;
  required?: boolean;
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const UnitOfMeasure: React.FC<UnitOfMeasureProps> = ({
  label = 'Đơn vị tính',
  required = false,
  value,
  options = [],
  onChange,
  placeholder = 'Chọn đơn vị tính',
  isOpen,
  onToggle,
}) => {
  const handleSelect = (option: string) => {
    onChange?.(option);
    onToggle();
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {required && <Text style={styles.required}>* </Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.trigger} onPress={onToggle} activeOpacity={0.7}>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#999'} />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option, index) => {
              const isSelected = option === value;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, zIndex: 9 },
  labelContainer: { flexDirection: 'row', marginBottom: spacing.xs },
  label: { fontSize: 14, color: colors.text, fontWeight: '400' },
  required: { fontSize: 14, color: colors.error },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  valueText: { flex: 1, fontSize: 15, color: colors.text },
  placeholderText: { color: colors.textSecondary },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 250,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  scrollContent: { paddingVertical: spacing.xs },
  option: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  selectedOption: { backgroundColor: '#F3F4F6' },
  optionText: { fontSize: 14, color: colors.text },
  selectedOptionText: { fontWeight: '500', color: colors.text },
});
