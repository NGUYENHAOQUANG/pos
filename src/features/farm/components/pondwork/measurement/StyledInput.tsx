import React from 'react';
import { View, StyleSheet, TextInputProps } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';

interface StyledInputProps extends TextInputProps {
    label: string;
    required?: boolean;
}

export const StyledInput: React.FC<StyledInputProps> = ({ label, required, ...props }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.asterisk}> *</Text>}
            </Text>
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.textSecondary || '#888'}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.sm,
        fontWeight: '500',
    },
    asterisk: {
        color: colors.error,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        height: 48,
        fontSize: 16,
        color: colors.text,
    },
});
