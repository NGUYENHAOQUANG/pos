/**
 * @file PhoneInput.tsx
 * @description Phone input component matching the Mebione design
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Giả định bạn đã có các biến này trong project, nếu chưa hãy thay bằng mã màu cứng
import { colors, spacing, typography, borderRadius, sizes } from '@/styles';

interface PhoneInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string; // Chuỗi lỗi để hiển thị
  onClear?: () => void; // Hàm reset lỗi hoặc xóa text
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Số điện thoại',
  placeholder = 'Nhập số điện thoại',
  value,
  onChangeText,
  error,
  onClear,
  countryCode,
  onCountryCodeChange,
  required,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Hàm format số điện thoại: 0908123456 -> 0908 123 456
  const formatAndSetPhone = (text: string) => {
    // Chỉ giữ lại số
    const cleaned = text.replace(/\D/g, '');

    // Logic format (4 số - 3 số - 3 số) hoặc tùy chỉnh
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    if (cleaned.length > 7) {
      formatted = `${formatted.slice(0, 8)} ${formatted.slice(8)}`;
    }

    // Giới hạn độ dài (ví dụ 10 số -> format xong dài khoảng 12-13 ký tự)
    if (formatted.length > 13) {
      return;
    }

    onChangeText(cleaned); // Trả về số thô cho parent component
  };

  // Hiển thị value đã format để render ra màn hình
  const getDisplayValue = () => {
    if (!value) return '';
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 4)} ${value.slice(4)}`;
    }
    if (value.length > 7) {
      formatted = `${formatted.slice(0, 8)} ${formatted.slice(8)}`;
    }
    return formatted;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !!error && styles.inputContainerError, // Nếu có lỗi thì viền đỏ
        ]}
      >
        <TextInput
          style={styles.input}
          value={getDisplayValue()}
          onChangeText={formatAndSetPhone}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || '#A0A0A0'}
          keyboardType="number-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Hiển thị icon X đỏ nếu có lỗi */}
        {!!error && (
          <TouchableOpacity onPress={onClear} style={styles.errorIcon}>
            <Ionicons name="close-circle" size={20} color={colors.error || '#FF4D4F'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dòng chữ báo lỗi bên dưới */}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text || '#333',
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    borderRadius: borderRadius.md || 8,
    backgroundColor: colors.white || '#FFF',
    height: 50,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary || '#1890FF',
  },
  inputContainerError: {
    borderColor: colors.error || '#FF4D4F', // Viền đỏ khi lỗi
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.lg || 16,
    color: colors.text || '#000',
    height: '100%',
  },
  errorIcon: {
    paddingLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm || 13,
    color: colors.error || '#FF4D4F',
    marginTop: spacing.xs,
  },
});

export default PhoneInput;
