import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';
import PlusIcon from '@/assets/Icon/Plus.svg';

/**
 * Props for the shared EmptyStateCard component
 */
export interface EmptyStateCardProps {
    /** Message to display under the empty state icon */
    message?: string;
    /** Description for the empty state */
    description?: string;
    /** Title for the action button */
    buttonTitle?: string;
    /** Callback when the action button is pressed */
    onPress?: () => void;
    /** Optional extra style for the action button */
    buttonStyle?: ViewStyle;
    /** Optional extra style for the container */
    style?: ViewStyle;
}

/**
 * A reusable empty state card with an illustration, message and a primary action button.
 *
 * @example
 * ```tsx
 * <EmptyStateCard
 *   message="Chưa có dữ liệu"
 *   buttonTitle="Thêm mới"
 *   onPress={handleAdd}
 * />
 * ```
 */
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    description,
    buttonTitle,
    onPress,
    buttonStyle,
    style,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={[styles.container, style]}>
            {/* Empty state illustration */}
            <View style={styles.iconContainer}>
                <EmptyStateIcon width={120} height={120} />
            </View>

            {/* Descriptive message */}
            {message && <Text style={styles.title}>{message}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}

            {/* Primary action button with Plus icon */}
            {buttonTitle && onPress && (
                <Button
                    title={buttonTitle}
                    onPress={onPress}
                    variant="primary"
                    size="medium"
                    style={StyleSheet.flatten([styles.button, buttonStyle])}
                    renderLeftIcon={<PlusIcon width={16} height={16} color="white" />}
                />
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
        },
        iconContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
        },
        title: {
            fontSize: 16,
            fontWeight: typography.fontWeight.semibold,
            color: theme.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.md,
        },
        description: {
            fontSize: 14,
            color: theme.textSecondary || theme.text,
            textAlign: 'center',
            marginBottom: spacing.lg,
            fontFamily: typography.fontFamily.regular,
            lineHeight: 22,
        },
        button: {
            width: '100%',
            height: 40,
        },
    });
