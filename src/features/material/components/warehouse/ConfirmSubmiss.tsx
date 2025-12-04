import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

interface ConfirmSubmissProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmSubmiss: React.FC<ConfirmSubmissProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Xác Nhận Gửi Phiếu Nhập Kho</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={20} color={colors.textSecondary || '#999'} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.message}>Bạn có chắc chắn muốn gửi?</Text>
                    </View>

                    {/* Footer / Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Không</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Đồng ý</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        maxWidth: 340,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        padding: spacing.lg,
        paddingVertical: spacing.xl,
    },
    message: {
        fontSize: 14,
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: spacing.md,
        gap: spacing.sm,
    },
    cancelButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    confirmButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.primary || '#1890FF',
    },
    confirmButtonText: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '400',
    },
});
