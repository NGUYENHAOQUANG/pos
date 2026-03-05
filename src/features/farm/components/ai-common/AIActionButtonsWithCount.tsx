import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, borderRadius } from '@/styles';

interface Props {
    count: number;
    countLabel: string;
    primaryLabel: string;
    secondaryLabel: string;
    primaryDisabled?: boolean;
    secondaryDisabled?: boolean;
    onPrimaryPress: () => void;
    onSecondaryPress: () => void;
}

export const AIActionButtonsWithCount: React.FC<Props> = ({
    count,
    countLabel,
    primaryLabel,
    secondaryLabel,
    primaryDisabled = false,
    secondaryDisabled = false,
    onPrimaryPress,
    onSecondaryPress,
}) => {
    const primaryButtonStyle = [styles.actionButton, primaryDisabled && styles.disabledButton];
    const primaryTextStyle = [
        styles.actionButtonText,
        primaryDisabled && styles.disabledButtonText,
    ];

    const secondaryButtonStyle = [styles.actionButton, secondaryDisabled && styles.disabledButton];
    const secondaryTextStyle = [
        styles.actionButtonText,
        secondaryDisabled && styles.disabledButtonText,
    ];

    return (
        <>
            <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                    onPress={onPrimaryPress}
                    disabled={primaryDisabled}
                    style={primaryButtonStyle}
                >
                    <Text style={primaryTextStyle}>{primaryLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={secondaryButtonStyle}
                    onPress={onSecondaryPress}
                    disabled={secondaryDisabled}
                >
                    <Text style={secondaryTextStyle}>{secondaryLabel}</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.countTimesText}>
                {countLabel}: {count}
            </Text>
        </>
    );
};

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
