import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/styles';
import { Input } from '@/shared/components/forms/Input';

interface GeneralInformationProps {
  name: string;
  onNameChange: (text: string) => void;
  contact: string;
  onContactChange: (text: string) => void;
  role: 'staff' | 'manager';
  onRoleChange: (role: 'staff' | 'manager') => void;
  disabled?: boolean;
}

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
  name,
  onNameChange,
  contact,
  onContactChange,
  role,
  onRoleChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin chung</Text>
      </View>

      {/* Form Content */}
      <View style={[styles.content, disabled && styles.disabledContent]}>
        {/* Name Input */}
        <Input
          label={true ? `* ${'Tên'}` : 'Tên'}
          required={false}
          value={name}
          onChangeText={onNameChange}
          placeholder="Input"
          containerStyle={styles.inputContainer}
          inputContainerStyle={disabled ? styles.inputDisabled : undefined}
          editable={!disabled}
          disabled={disabled}
        />

        {/* Contact Input */}
        <Input
          label={true ? `* ${'Số điện thoại hoặc Email'}` : 'Số điện thoại hoặc Email'}
          required={false}
          value={contact}
          onChangeText={onContactChange}
          placeholder="Input"
          containerStyle={styles.inputContainer}
          inputContainerStyle={disabled ? styles.inputDisabled : undefined}
          editable={!disabled}
          disabled={disabled}
        />

        {/* Role Selection (Radio) */}
        <View style={styles.roleContainer}>
          <Text style={styles.label}>
            <Text style={styles.required}>* </Text>Chọn chức vụ
          </Text>

          <View style={styles.radioGroup}>
            {/* Staff Option */}
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => onRoleChange('staff')}
              activeOpacity={0.8}
              disabled={disabled}
            >
              <Ionicons
                name={role === 'staff' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={
                  disabled
                    ? colors.textSecondary
                    : role === 'staff'
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <Text style={[styles.radioText, disabled && { color: colors.textSecondary }]}>
                Nhân viên
              </Text>
            </TouchableOpacity>

            {/* Manager Option */}
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => onRoleChange('manager')}
              activeOpacity={0.8}
              disabled={disabled}
            >
              <Ionicons
                name={role === 'manager' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={
                  disabled
                    ? colors.textSecondary
                    : role === 'manager'
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <Text style={[styles.radioText, disabled && { color: colors.textSecondary }]}>
                Quản lý
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.md,
  },
  disabledContent: {
    // opacity: 0.6, // Removed to keep text dark
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  roleContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: colors.gray[200],
  },
});
