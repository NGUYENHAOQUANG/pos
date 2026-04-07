/**
 * @file PhoneInput.tsx
 * @description Phone input component matching the Mebione design
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import DangerIcon from '@/assets/Icon/Danger.svg';
import { spacing, typography, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    required,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

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
            {label && (
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{label}</Text>
                    {required && <Text style={styles.requiredDot}>{'\u2022'}</Text>}
                </View>
            )}

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
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="number-pad"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>

            {/* Dòng chữ báo lỗi bên dưới - chỉ hiển thị nếu error là string (không phải 'error') */}
            {!!error && error !== 'error' && (
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconWrapper}>
                        <DangerIcon width={16} height={16} />
                    </View>
                    <Text style={[styles.errorText, { flex: 1 }]}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {},
        labelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
            gap: 4,
        },
        label: {
            fontSize: typography.fontSize.base,
            color: theme.text,
            fontWeight: '500',
            lineHeight: 20,
        },
        requiredDot: {
            color: theme.error,
            fontSize: typography.fontSize.base,
            fontWeight: '700',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: borderRadius.md,
            backgroundColor: theme.background,
            height: 50,
            paddingHorizontal: spacing.md,
        },
        inputContainerFocused: {
            borderColor: theme.primary,
            boxShadow: `0px 0px 4px ${theme.primary}40`,
        },
        inputContainerError: {
            borderColor: theme.error, // Viền đỏ khi lỗi
        },
        input: {
            flex: 1,
            fontSize: typography.fontSize.lg,
            color: theme.text,
            height: '100%',
        },
        errorIcon: {
            paddingLeft: spacing.xs,
        },
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 4,
            gap: 6,
        },
        errorIconWrapper: {
            marginTop: 2, // Đưa icon xuống một chút để thẳng hàng với dòng đầu tiên của text
        },
        errorText: {
            fontSize: typography.fontSize.sm,
            color: theme.error,
            lineHeight: 20,
        },
    });

export default PhoneInput;
