import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius, typography } from '@/styles';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

interface EmptyStateCardProps {
    message: string;
    buttonTitle: string;
    onPress: () => void;
    buttonStyle?: ViewStyle;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    buttonTitle,
    onPress,
    buttonStyle,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <EmptyStateIcon width={120} height={120} />
            </View>
            <Text style={styles.text}>{message}</Text>
            <Button
                title={buttonTitle}
                onPress={onPress}
                iconLeft="add"
                variant="primary"
                size="medium"
                style={StyleSheet.flatten([styles.button, buttonStyle])}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontFamily: typography.fontFamily.regular,
    },
    button: {
        minWidth: 160,
    },
});
