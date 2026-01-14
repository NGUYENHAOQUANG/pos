/**
 * @file PhoneInput.tsx
 * @description Phone input component matching the Mebione design
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// Giả định bạn đã có các biến này trong project, nếu chưa hãy thay bằng mã màu cứng
import { colors, spacing, typography, borderRadius } from '@/styles';

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
    // onClear,
    countryCode: _countryCode,
    onCountryCodeChange: _onCountryCodeChange,
    required: _required,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    // Hàm format số điện thoại: 0908123456 -> 0908 123 456
    const formatAndSetPhone = (text: string) => {
        // Chỉ giữ lại số
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 10) {
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
                    !error && isFocused && styles.inputContainerFocused,
                    (!!error || error === 'error') && styles.inputContainerError, // Nếu có lỗi thì viền đỏ
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={getDisplayValue()}
                    onChangeText={formatAndSetPhone}
                    placeholder={placeholder}
                    placeholderTextColor={colors.gray[300]}
                    keyboardType="number-pad"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Hiển thị icon X đỏ nếu có lỗi */}
                {/* {!!error && (
          <TouchableOpacity onPress={onClear} style={styles.errorIcon}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
          </TouchableOpacity>
        )} */}
            </View>

            {/* Dòng chữ báo lỗi bên dưới - chỉ hiển thị nếu error là string (không phải 'error') */}
            {!!error && error !== 'error' && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    label: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        marginBottom: spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        height: 50,
        paddingHorizontal: spacing.md,
    },
    inputContainerFocused: {
        boxShadow: `0px 0px 4px ${colors.primaryLight}`,
    },
    inputContainerError: {
        borderColor: colors.error, // Viền đỏ khi lỗi
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        color: colors.text,
        height: '100%',
    },
    errorIcon: {
        paddingLeft: spacing.xs,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
        marginTop: 2, // 2px từ input container đến error text
    },
});

export default PhoneInput;
