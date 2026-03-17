/**
 * @file ResendCodeBtn.tsx
 * @description Resend code button component using Ant Design React Native
 * @updated 2025-11-17 - Migrated to ANTD-RN Button
 *
 * @see https://rn.mobile.ant.design/components/button
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@ant-design/react-native';
import { colors } from '@/styles';

interface ResendCodeBtnProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

/**
 * ResendCodeBtn component for resending verification codes
 * Uses ANTD-RN Button with ghost type and primary color styling
 */
export function ResendCodeBtn({ title, onPress, disabled = false }: ResendCodeBtnProps) {
    return (
        <Button type="ghost" onPress={onPress} disabled={disabled} style={styles.button}>
            <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{title}</Text>
        </Button>
    );
}

const styles = StyleSheet.create({
    button: {
        borderWidth: 0,
    },
    buttonText: {
        color: colors.primary,
    },
    buttonTextDisabled: {
        color: colors.textTertiary,
    },
});
