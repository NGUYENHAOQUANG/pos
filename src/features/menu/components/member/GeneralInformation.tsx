import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors, spacing, typography } from '@/styles';
import { Input, RequiredDot } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';

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
                    label="Tên"
                    required={true}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Tên"
                    containerStyle={styles.inputContainer}
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
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={disabled ? styles.inputDisabled : undefined}
                    editable={!disabled}
                    disabled={disabled}
                />

                {/* Role Selection (Radio) */}
                <View style={styles.roleContainer}>
                    <View style={styles.fieldLabelWrapper}>
                        <Text style={styles.fieldLabelText}>Chọn chức vụ</Text>
                        <RequiredDot />
                    </View>

                    <RadioButton
                        options={[
                            { label: 'Nhân viên', value: 'staff' },
                            { label: 'Quản lý', value: 'manager' },
                        ]}
                        value={role}
                        onValueChange={onRoleChange as any}
                        disabled={disabled}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        overflow: 'hidden',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 0,
    },
    fieldLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    fieldLabelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },

    inputDisabled: {
        backgroundColor: colors.gray[200],
    },
});
