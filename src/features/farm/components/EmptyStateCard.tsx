import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Platform,
    ImageSourcePropType,
    ViewStyle,
} from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius } from '@/styles';

interface EmptyStateCardProps {
    message?: string;
    description?: string;
    buttonTitle?: string;
    onPress?: () => void;
    imageSource?: ImageSourcePropType;
    style?: ViewStyle;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    description,
    buttonTitle,
    onPress,
    imageSource = require('@/assets/images/EmptyState.png'),
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
            {message && <Text style={styles.message}>{message}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
            {buttonTitle && onPress && (
                <Button
                    title={buttonTitle}
                    onPress={onPress}
                    variant="primary"
                    iconLeft="add"
                    size="medium"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
        gap: spacing.md,
    },
    image: {
        width: 100,
        height: 61,
    },
    message: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '400',
    },
    button: {
        marginTop: spacing.md,
        minWidth: 160,
    },
    pondCycleEmptyState: {
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        padding: spacing.md,
        borderRadius: 0,
    },
});

interface PondCycleEmptyStateProps {
    message?: string;
    description?: string;
}

export const PondCycleEmptyState: React.FC<PondCycleEmptyStateProps> = ({
    description = 'Ao chưa có chu kỳ nuôi nào.\nThực hiện các công việc được liệt kê bên dưới để chuẩn bị ao trước khi bắt đầu chu kỳ nuôi.',
}) => <EmptyStateCard description={description} style={styles.pondCycleEmptyState} />;
