import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    primaryButtonStyle?: ViewStyle;
    primaryButtonTextStyle?: TextStyle;
    secondaryButtonStyle?: ViewStyle;
    secondaryButtonTextStyle?: TextStyle;
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
    primaryButtonStyle,
    primaryButtonTextStyle,
    secondaryButtonStyle,
    secondaryButtonTextStyle,
    containerStyle,
}) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
            setVisible(false);
        });
        const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
            setVisible(true);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    if (!visible) return null;

    // Consistent bottom spacing logic
    // Use insets.bottom + 12px for consistent internal padding
    // This ensures it doesn't stick to the home indicator on iOS
    // and looks consistent on Android (where insets.bottom is usually 0)
    const paddingBottom = insets.bottom + 12;

    const renderContent = () => {
        switch (mode) {
            case 'total':
                return (
                    <View style={styles.row}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>{totalLabel}</Text>
                            <Text style={styles.totalValue}>{totalValue}</Text>
                        </View>
                        <Button
                            title={primaryTitle}
                            onPress={onPrimaryPress || (() => {})}
                            variant="primary"
                            size="medium"
                            disabled={primaryButtonDisabled}
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
                        />
                        <View style={styles.spacer} />
                        <Button
                            title={primaryTitle}
                            onPress={onPrimaryPress || (() => {})}
                            variant="primary"
                            size="medium"
                            disabled={primaryButtonDisabled}
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
        paddingTop: 12, // Fixed top padding
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
