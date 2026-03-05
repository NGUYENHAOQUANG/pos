import React from 'react';
import Toast from 'react-native-toast-message';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';

/**
 * Props for ConfirmationDeleteModal component
 */
interface ConfirmationDeleteModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Callback function called when user confirms deletion */
    onConfirm: () => void;
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
}

/**
 * A reusable modal component for confirming deletion actions.
 * Displays title + X button on top row, message body, and two action buttons.
 */
export const ConfirmationDeleteModal: React.FC<ConfirmationDeleteModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    title = 'Xoá tác vụ',
    message = 'Bạn có chắc chắn muốn xoá tác vụ này không?',
    confirmText = 'Đồng ý',
    cancelText = 'Không',
    successMessage = 'Tác vụ đã được xóa',
    showSuccessToast = true,
}) => {
    const handleConfirm = () => {
        onConfirm();
        if (showSuccessToast) {
            Toast.show({
                type: 'success',
                text1: successMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header row: title + X close button */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity
                                    onPress={onCancel}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon width={16} height={16} />
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
                                    style={[styles.cancelButton, styles.cancelButtonOverride]}
                                    textStyle={styles.cancelButtonTextOverride}
                                />
                                <Button
                                    title={confirmText}
                                    onPress={handleConfirm}
                                    variant="primary"
                                    style={styles.confirmButton}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
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
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        marginLeft: spacing.sm,
    },
    // Body message
    message: {
        fontSize: typography.fontSize.base,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    // Button row
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    cancelButton: {
        flex: 1,
    },
    // Override blue outline to gray for cancel button
    cancelButtonOverride: {
        borderColor: colors.gray[300],
    },
    cancelButtonTextOverride: {
        color: colors.text,
    },
    confirmButton: {
        flex: 1,
    },
});
