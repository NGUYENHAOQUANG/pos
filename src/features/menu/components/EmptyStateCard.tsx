import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius, typography } from '@/styles';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import PlusIcon from '@/assets/Icon/Plus.svg';

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
                variant="primary"
                size="medium"
                style={StyleSheet.flatten([styles.button, buttonStyle])}
                renderLeftIcon={<PlusIcon width={16} height={16} color="white" />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.transparent,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.regular,
    },
    button: {
        width: '100%',
        height: 40,
    },
});
