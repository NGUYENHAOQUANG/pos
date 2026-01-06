import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

export type ConfirmationModalType =
    | 'transfer'
    | 'harvest_full'
    | 'harvest_close_cycle'
    | 'measure_size_required';

interface ConfirmationConfig {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
}

const CONFIRMATION_CONFIGS: Record<ConfirmationModalType, ConfirmationConfig> = {
    transfer: {
        title: 'Xác nhận sang ao',
        message: `Việc sang ao sẽ kết thúc chu kỳ hiện tại ở ao vèo và tiếp tục giai đoạn nuôi ở ao nuôi.
Sau khi thực hiện, bạn sẽ không thể chỉnh sửa lại dữ liệu của giai đoạn vèo.
Bạn có chắc muốn sang ao không?`,
        confirmText: 'Sang ao',
        cancelText: 'Không',
    },
    harvest_full: {
        title: 'Xác nhận thu hoạch hết',
        message: `Việc thu hoạch hết sẽ kết thúc chu kỳ nuôi hiện tại và không thể hoàn tác.
Bạn có chắc chắn muốn thu hoạch hết không?`,
        confirmText: 'Thu hết',
        cancelText: 'Không',
    },
    harvest_close_cycle: {
        title: 'Xác nhận đóng chu kỳ',
        message: `Việc đóng chu kỳ sẽ kết thúc chu kỳ nuôi hiện tại và không thể hoàn tác.
Bạn có chắc chắn muốn đóng chu kỳ không?`,
        confirmText: 'Đóng chu kỳ',
        cancelText: 'Không',
    },
    measure_size_required: {
        title: 'Cần đo kích thước tôm',
        message:
            'Cần đo kích thước tôm trước khi tiến hành sang ao. Bạn có muốn đo kích thước tôm ngay bây giờ không?',
        confirmText: 'Xác nhận',
        cancelText: 'Hủy',
    },
};

interface ConfirmationModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    type: ConfirmationModalType;
    // Optional overrides for custom messages
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    type,
    title,
    message,
    confirmText,
    cancelText,
}) => {
    const config = CONFIRMATION_CONFIGS[type];
    const finalTitle = title || config.title;
    const finalMessage = message || config.message;
    const finalConfirmText = confirmText || config.confirmText;
    const finalCancelText = cancelText || config.cancelText;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.content}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {finalTitle}
                                    </Text>
                                    <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
                                        <Ionicons
                                            name="close"
                                            size={14}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Message */}
                                <View style={styles.messageContainer}>
                                    <Text style={styles.message}>{finalMessage}</Text>
                                </View>

                                {/* Buttons */}
                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={onCancel}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.cancelButtonText}>
                                            {finalCancelText}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={onConfirm}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.confirmButtonText}>
                                            {finalConfirmText}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 341,
    },
    content: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 24,
        marginRight: spacing.sm,
    },
    messageContainer: {
        gap: spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.defaultBorder,
        padding: spacing.md,
    },
    message: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        padding: spacing.md,
    },
    cancelButton: {
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderMedium,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 24,
    },
    confirmButton: {
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.white,
        lineHeight: 24,
    },
});
