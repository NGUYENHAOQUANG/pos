import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius } from '@/styles';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

interface EmptyStateCardProps {
    message: string;
    description?: string;
    buttonTitle?: string;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'default' | 'flat';
    buttonSize?: 'small' | 'medium' | 'large';
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    description,
    buttonTitle,
    onPress,
    style,
    variant = 'default',
    buttonSize,
}) => {
    const isFlat = variant === 'flat';
    return (
        <View style={[styles.container, isFlat && styles.flatContainer, style]}>
            <EmptyStateIcon
                width={isFlat ? 80 : 100}
                height={isFlat ? 80 : 64}
                style={[styles.image, isFlat && styles.flatImage]}
            />
            <Text style={styles.message}>{message}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {buttonTitle && onPress && (
                <Button
                    title={buttonTitle}
                    onPress={onPress}
                    variant="primary"
                    iconLeft="add"
                    size={buttonSize || (isFlat ? 'small' : 'medium')}
                    style={styles.button}
                />
            )}
        </View>
    );
};

interface EmptyPondStateProps {
    onAddPond?: () => void;
}

export const EmptyPondState: React.FC<EmptyPondStateProps> = ({ onAddPond }) => (
    <EmptyStateCard
        message="Chưa có ao nào được thêm."
        description="Vui lòng thêm ao để quản lý thiết bị."
        buttonTitle="Thêm ao"
        onPress={onAddPond}
        style={styles.emptyPondState}
    />
);

interface EmptyDeviceStateProps {
    onAddDevice?: () => void;
}

// ...
export const EmptyDeviceState: React.FC<EmptyDeviceStateProps> = ({ onAddDevice }) => (
    <EmptyStateCard
        message="Chưa có thiết bị nào được thêm."
        buttonTitle="Thêm thiết bị"
        onPress={onAddDevice}
        variant="flat"
        buttonSize="medium"
        style={styles.emptyDeviceContainer}
    />
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    flatContainer: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: spacing.md,
        shadowOpacity: 0,
        elevation: 0,
        marginBottom: 0,
    },
    image: {
        marginBottom: spacing.md,
        opacity: 0.8,
    },
    flatImage: {
        width: 80,
        height: 80,
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 16,
        color: colors.text, // Removed fontWeight: '500'
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.md,
        maxWidth: '90%',
    },
    button: {
        marginTop: spacing.md,
        minWidth: 160,
    },
    pondCycleEmptyState: {
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        borderRadius: 0,
    },
    emptyPondState: {
        height: '30%',
        width: '100%',
    },
    emptyDeviceContainer: {
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 0, // Ensure no extra horizontal padding if container already has it
    },
});
