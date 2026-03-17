import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

export type ConfirmationModalType =
    | 'transfer'
    | 'harvest_full'
    | 'harvest_close_cycle'
    | 'measure_size_required'
    | 'reset_check'
    | 'measure_reset'
    | 'unsaved_changes'
    | 'counting_reset';

interface ConfirmationConfig {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    /** Optional prefix rendered in red (e.g. "* ") */
    messagePrefix?: string;
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
    reset_check: {
        title: 'Kiểm tra lại',
        message: 'Bạn có chắc chắn muốn kiểm tra lại không? Dữ liệu hiện tại sẽ bị xóa.',
        confirmText: 'Đồng ý',
        cancelText: 'Hủy',
    },
    measure_reset: {
        title: 'Đo lại',
        message: 'Bạn có chắc chắn muốn đo lại không? Dữ liệu hiện tại sẽ bị xóa.',
        confirmText: 'Đồng ý',
        cancelText: 'Hủy',
    },
    unsaved_changes: {
        title: 'Thay đổi chưa lưu',
        message: 'Bạn có thay đổi chưa lưu,\nBạn có chắc chắn muốn thoát?',
        confirmText: 'Có',
        cancelText: 'Không',
    },
    counting_reset: {
        title: 'Xác nhận đếm lại',
        messagePrefix: '* ',
        message: 'Đếm lại sẽ ghi đè lên TẤT CẢ các lần đếm trước đó, bạn có chắc chắn muốn đếm lại',
        confirmText: 'Đồng ý',
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
    message?: string | React.ReactNode;
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
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    React.useEffect(() => {
        if (visible) {
            // Reset position before animating to ensure slide-up works every time
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const config = CONFIRMATION_CONFIGS[type];
    const finalTitle = title ?? config.title;
    const finalConfirmText = confirmText ?? config.confirmText;
    const finalCancelText = cancelText ?? config.cancelText;
    const hasMessageOverride = message !== undefined && message !== null;
    const finalMessage = hasMessageOverride ? message : config.message;
    const useConfigMessageWithPrefix =
        !hasMessageOverride && config.messagePrefix != null && config.messagePrefix !== '';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
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
                                    {useConfigMessageWithPrefix ? (
                                        <Text style={styles.message}>
                                            <Text style={styles.messageRequired}>
                                                {config.messagePrefix}
                                            </Text>
                                            {finalMessage}
                                        </Text>
                                    ) : typeof finalMessage === 'string' ? (
                                        <Text style={styles.message}>{finalMessage}</Text>
                                    ) : (
                                        finalMessage
                                    )}
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
                        </Animated.View>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    container: {
        width: '100%',
    },
    content: {
        backgroundColor: colors.white,
        borderRadius: 24,
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
    messageRequired: {
        color: colors.red[500],
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
