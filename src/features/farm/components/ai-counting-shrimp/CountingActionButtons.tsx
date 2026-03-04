import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

export interface CountingActionButtonsProps {
    countTimes: number;
    isSecondaryDisabled: boolean;
    secondaryButtonLabel: string;
    onReset: () => void;
    onSecondaryPress: () => void;
}

export const CountingActionButtons: React.FC<CountingActionButtonsProps> = ({
    countTimes,
    isSecondaryDisabled,
    secondaryButtonLabel,
    onReset,
    onSecondaryPress,
}) => (
    <>
        <View style={styles.actionButtonsRow}>
            <TouchableOpacity
                onPress={onReset}
                disabled={countTimes === 0}
                style={[styles.actionButton, countTimes === 0 && styles.disabledButton]}
            >
                <Text
                    style={[styles.actionButtonText, countTimes === 0 && styles.disabledButtonText]}
                >
                    Đếm lại
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, isSecondaryDisabled && styles.disabledButton]}
                onPress={onSecondaryPress}
                disabled={isSecondaryDisabled}
            >
                <Text
                    style={[
                        styles.actionButtonText,
                        isSecondaryDisabled && styles.disabledButtonText,
                    ]}
                >
                    {secondaryButtonLabel}
                </Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.countTimesText}>Số lần đếm: {countTimes}</Text>
    </>
);

const styles = StyleSheet.create({
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    countTimesText: {
        fontSize: 16,
        color: colors.text,
    },
    disabledButton: {
        backgroundColor: colors.gray[100],
        borderColor: colors.gray[200],
    },
    disabledButtonText: {
        color: colors.textSecondary,
    },
});
