import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const isFlat = variant === 'flat';

    return (
        <View style={[themedStyles.container, isFlat && styles.flatContainer, style]}>
            <EmptyStateIcon
                width={isFlat ? 80 : 100}
                height={isFlat ? 80 : 64}
                style={[styles.image, isFlat && styles.flatImage]}
            />
            <Text style={themedStyles.message}>{message}</Text>
            {description && <Text style={themedStyles.description}>{description}</Text>}
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

// Static styles
const styles = StyleSheet.create({
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
    button: {
        marginTop: spacing.md,
        minWidth: 160,
    },
    emptyPondState: {
        height: '30%',
        width: '100%',
    },
    emptyDeviceContainer: {
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 0,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            padding: spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
        },
        message: {
            fontSize: 16,
            color: theme.text,
            textAlign: 'center',
            marginBottom: spacing.xs,
        },
        description: {
            fontSize: 14,
            color: theme.text,
            textAlign: 'center',
            marginTop: spacing.xs,
            marginBottom: spacing.md,
            maxWidth: '90%',
        },
    });
