import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/components/buttons/Button';
import { borderRadius, colors, spacing } from '@/styles';
import { usePreventDoubleTap } from '@/shared/hooks/usePreventDoubleTap';

export type ButtonBarMode = 'total' | 'single' | 'double';

export interface ButtonBarProps {
    mode?: ButtonBarMode;
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void | Promise<void>;
    onSecondaryPress?: () => void | Promise<void>;
    totalLabel?: string;
    totalValue?: string | number | React.ReactNode;
    primaryButtonDisabled?: boolean;
    primaryButtonLoading?: boolean;
    primaryButtonStyle?: ViewStyle;
    primaryButtonTextStyle?: TextStyle;
    secondaryButtonStyle?: ViewStyle;
    secondaryButtonTextStyle?: TextStyle;
    secondaryButtonDisabled?: boolean;
    secondaryButtonLoading?: boolean;
    containerStyle?: ViewStyle;
}

export const ButtonBar: React.FC<ButtonBarProps> = ({
    mode = 'single',
    primaryTitle = 'Lưu',
    secondaryTitle = 'Huỷ',
    onPrimaryPress,
    onSecondaryPress,
    totalLabel = 'Tổng tiền:',
    totalValue = '0đ',
    primaryButtonDisabled = false,
    primaryButtonLoading = false,
    primaryButtonStyle,
    primaryButtonTextStyle,
    secondaryButtonStyle,
    secondaryButtonTextStyle,
    secondaryButtonDisabled = false,
    secondaryButtonLoading = false,
    containerStyle,
}) => {
    const insets = useSafeAreaInsets();
    // Use actual safe area insets with minimum fallback
    const paddingBottom = Math.max(insets.bottom, 12);

    const [safePrimaryPress, isPrimaryProcessing] = usePreventDoubleTap(onPrimaryPress, 500);
    const [safeSecondaryPress] = usePreventDoubleTap(onSecondaryPress, 500);

    // Auto-disable and show loading when async callback is in progress
    const isPrimaryDisabled = primaryButtonDisabled || isPrimaryProcessing;
    const isPrimaryLoading = primaryButtonLoading || isPrimaryProcessing;

    const renderContent = () => {
        switch (mode) {
            case 'total':
                return (
                    <View style={styles.row}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel} maxFontSizeMultiplier={1.1}>
                                {totalLabel}
                            </Text>
                            <Text style={styles.totalValue} maxFontSizeMultiplier={1.1}>
                                {totalValue}
                            </Text>
                        </View>
                        <Button
                            title={primaryTitle}
                            onPress={safePrimaryPress}
                            variant="primary"
                            size="medium"
                            disabled={isPrimaryDisabled}
                            loading={isPrimaryLoading}
                            style={StyleSheet.flatten([styles.primaryButton, primaryButtonStyle])}
                            textStyle={primaryButtonTextStyle}
                        />
                    </View>
                );
            case 'double':
                return (
                    <View style={styles.row}>
                        <Button
                            title={secondaryTitle}
                            onPress={safeSecondaryPress}
                            variant="outline"
                            size="medium"
                            style={StyleSheet.flatten([
                                styles.secondaryButton,
                                secondaryButtonStyle,
                            ])}
                            textStyle={StyleSheet.flatten([
                                { color: colors.text },
                                secondaryButtonTextStyle,
                            ])}
                            disabled={secondaryButtonDisabled}
                            loading={secondaryButtonLoading}
                        />
                        <View style={styles.spacer} />
                        <Button
                            title={primaryTitle}
                            onPress={safePrimaryPress}
                            variant="primary"
                            size="medium"
                            disabled={isPrimaryDisabled}
                            loading={isPrimaryLoading}
                            style={StyleSheet.flatten([styles.flexButton, primaryButtonStyle])}
                            textStyle={primaryButtonTextStyle}
                        />
                    </View>
                );
            case 'single':
            default:
                return (
                    <View style={styles.row}>
                        <Button
                            title={primaryTitle}
                            onPress={safePrimaryPress}
                            variant="primary"
                            size="medium"
                            disabled={isPrimaryDisabled}
                            loading={isPrimaryLoading}
                            fullWidth
                            style={StyleSheet.flatten([styles.fullButton, primaryButtonStyle])}
                            textStyle={primaryButtonTextStyle}
                        />
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { paddingBottom }, containerStyle]}>{renderContent()}</View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        paddingTop: 16, // Fixed top padding 16 as requested
        paddingHorizontal: spacing.md,
        // paddingBottom is handled dynamically
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    totalContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    totalLabel: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.error,
    },
    primaryButton: {
        minWidth: 120,
        height: 40,
        borderRadius: borderRadius.full,
    },
    secondaryButton: {
        minWidth: 100,
        height: 40,
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
    },
    flexButton: {
        flex: 1,
        height: 40,
    },
    fullButton: {
        flex: 1,
        height: 40,
    },
    spacer: {
        width: spacing.md,
    },
});
