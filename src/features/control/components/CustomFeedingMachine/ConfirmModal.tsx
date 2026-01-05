import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

interface ConfirmModalProps {
    visible: boolean;
    onConfirm: () => void; // Action (e.g., Leave)
    onCancel: () => void; // Stay
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    title = 'Bạn có thay đổi chưa được lưu lại',
    message = 'Những thay đổi của bạn sẽ không được lưu lại nếu bạn rời trang',
    confirmText = 'Rời trang và không lưu',
    cancelText = 'Ở lại',
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.dialog}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                                    <Ionicons name="close" size={20} color={colors.gray[400]} />
                                </TouchableOpacity>
                            </View>

                            {/* Body */}
                            <View style={styles.fullWidthDivider} />
                            <View style={styles.body}>
                                <Text style={styles.message}>{message}</Text>
                            </View>
                            <View style={styles.fullWidthDivider} />
                            {/* Footer */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onCancel}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                                </TouchableOpacity>
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
        padding: 24,
    },
    dialog: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    body: {
        padding: 16,
    },
    message: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        gap: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
    },
    fullWidthDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
    },
});
