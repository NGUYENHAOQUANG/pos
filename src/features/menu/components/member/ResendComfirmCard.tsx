import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface ResendComfirmCardProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export const ResendComfirmCard: React.FC<ResendComfirmCardProps> = ({
    visible,
    onClose,
    onConfirm,
    title = 'Gửi lại lời mời',
    message = 'Thành viên này vẫn chưa kích hoạt tài khoản. Bạn có muốn gửi lại lời mời để họ hoàn tất xác nhận?',
    confirmText = 'Gửi lại',
    cancelText = 'Không',
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header with Title and Close Icon */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Content */}
                            <View style={styles.content}>
                                <Text style={styles.message}>{message}</Text>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.md,
        },
        container: {
            width: '100%',
            backgroundColor: theme.white,
            borderRadius: borderRadius.md,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.md,
            paddingBottom: spacing.sm,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
        },
        divider: {
            height: 1,
            backgroundColor: theme.border,
            width: '100%',
        },
        content: {
            padding: spacing.md,
        },
        message: {
            fontSize: 14,
            color: theme.text,
            lineHeight: 20,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            padding: spacing.md,
        },
        cancelButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.white,
            minWidth: 80,
            alignItems: 'center',
        },
        cancelButtonText: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
        },
        confirmButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: borderRadius.sm,
            backgroundColor: theme.primary,
            minWidth: 80,
            alignItems: 'center',
        },
        confirmButtonText: {
            fontSize: 14,
            color: theme.white,
            fontWeight: '500',
        },
    });
