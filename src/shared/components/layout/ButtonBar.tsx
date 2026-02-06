import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

export type ButtonBarMode = 'total' | 'single' | 'double';

export interface ButtonBarProps {
    mode?: ButtonBarMode;
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
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
    // Consistent bottom spacing logic
    // iOS: 32, Android: 16
    const paddingBottom = Platform.OS === 'ios' ? 32 : 16;

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
                            onPress={onPrimaryPress || (() => {})}
                            variant="primary"
                            size="medium"
                            disabled={primaryButtonDisabled}
                            loading={primaryButtonLoading}
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
                            onPress={onSecondaryPress || (() => {})}
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
                            onPress={onPrimaryPress || (() => {})}
                            variant="primary"
                            size="medium"
                            disabled={primaryButtonDisabled}
                            loading={primaryButtonLoading}
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
                            onPress={onPrimaryPress || (() => {})}
                            variant="primary"
                            size="medium"
                            disabled={primaryButtonDisabled}
                            loading={primaryButtonLoading}
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
    },
    secondaryButton: {
        minWidth: 100,
        height: 40,
        backgroundColor: colors.white,
        borderColor: colors.border,
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
