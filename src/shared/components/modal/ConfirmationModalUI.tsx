import React from 'react';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { usePreventDoubleTap } from '@/shared/hooks/usePreventDoubleTap';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';

/**
 * Props for ConfirmationModalUI component
 */
interface ConfirmationModalUIProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Callback function called when user confirms deletion */
    onConfirm: () => void | Promise<void>;
    /** Callback function called when user cancels deletion */
    onCancel: () => void;
    /** Title text displayed in the modal */
    title?: string;
    /** Message text displayed in the modal */
    message?: string;
    /** Text for the confirm button */
    confirmText?: string;
    /** Text for the cancel button */
    cancelText?: string;
    /** Toast message on success */
    successMessage?: string;
    /** Whether to show success toast after confirm (default: true) */
    showSuccessToast?: boolean;
    /** Custom style for the cancel button */
    cancelButtonStyle?: StyleProp<ViewStyle>;
    /** Custom style for the confirm button */
    confirmButtonStyle?: StyleProp<ViewStyle>;
}

/**
 * A reusable modal component for confirming deletion actions.
 * Displays title + X button on top row, message body, and two action buttons.
 */
export const ConfirmationModalUI: React.FC<ConfirmationModalUIProps> = ({
    visible,
    onConfirm,
    onCancel,
    title = 'Xoá tác vụ',
    message = 'Bạn có chắc chắn muốn xoá tác vụ này không?',
    confirmText = 'Đồng ý',
    cancelText = 'Không',
    successMessage = 'Tác vụ đã được xóa',
    showSuccessToast = true,
    cancelButtonStyle,
    confirmButtonStyle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [safeConfirm, isConfirming] = usePreventDoubleTap(() => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                const result = onConfirm();
                if (result && typeof (result as Promise<void>).then === 'function') {
                    (result as Promise<void>).then(resolve, resolve);
                } else {
                    resolve();
                }
                if (showSuccessToast) {
                    Toast.show({
                        type: 'success',
                        text1: successMessage,
                        visibilityTime: 3000,
                    });
                }
            }, 300);
        });
    }, 1000);

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onCancel}
            overlayStyle={styles.overlay}
            containerStyle={styles.container}
        >
            {/* Header row: title + X close button */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                    onPress={onCancel}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={16} height={16} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Message body */}
            <Text style={styles.message}>{message}</Text>

            {/* Footer buttons */}
            <View style={styles.footer}>
                <Button
                    title={cancelText}
                    onPress={onCancel}
                    variant="outline"
                    style={[styles.cancelButton, styles.cancelButtonOverride, cancelButtonStyle]}
                    textStyle={styles.cancelButtonTextOverride}
                />
                <Button
                    title={confirmText}
                    onPress={safeConfirm}
                    variant="primary"
                    loading={isConfirming}
                    disabled={isConfirming}
                    style={[styles.confirmButton, confirmButtonStyle]}
                />
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingBottom: 16,
        },
        container: {
            width: '100%',
            backgroundColor: theme.background,
            borderRadius: 24,
            padding: spacing.lg,
        },
        // Header row: title left, X right
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
        },
        title: {
            fontSize: typography.fontSize.lg,
            fontWeight: '700',
            color: theme.text,
            flex: 1,
        },
        closeButton: {
            marginLeft: spacing.sm,
        },
        // Body message
        message: {
            fontSize: typography.fontSize.base,
            fontWeight: '400',
            color: theme.text,
            lineHeight: 22,
            marginBottom: spacing.lg,
        },
        // Button row
        footer: {
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: spacing.md,
        },
        cancelButton: {
            flex: 1,
        },
        // Override blue outline to gray for cancel button
        cancelButtonOverride: {
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        cancelButtonTextOverride: {
            color: theme.text,
            fontSize: 14,
        },
        confirmButton: {
            flex: 1,
        },
    });
