import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Input } from '@/shared/components/forms/Input';

interface GeneralInformationProps {
    name: string;
    onNameChange: (text: string) => void;
    contact: string;
    onContactChange: (text: string) => void;
    disabled?: boolean;
}

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
    name,
    onNameChange,
    contact,
    onContactChange,
    disabled = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
                    label="Tên"
                    required={true}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Tên"
                    inputContainerStyle={disabled ? styles.inputDisabled : undefined}
                    editable={!disabled}
                    disabled={disabled}
                />

                {/* Contact Input */}
                <Input
                    label="Số điện thoại hoặc Email"
                    required={true}
                    value={contact}
                    onChangeText={onContactChange}
                    placeholder="Số điện thoại hoặc Email"
                    inputContainerStyle={disabled ? styles.inputDisabled : undefined}
                    editable={!disabled}
                    disabled={disabled}
                />
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            overflow: 'hidden',
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        header: {
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        content: {
            padding: spacing.md,
            paddingBottom: 0,
        },
        disabledContent: {
            // opacity: 0.6, // Removed to keep text dark
        },
        inputDisabled: {
            backgroundColor: theme.gray[200],
        },
    });
