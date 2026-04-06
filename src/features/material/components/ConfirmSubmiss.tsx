import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';

interface ConfirmSubmissProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmSubmiss: React.FC<ConfirmSubmissProps> = ({ visible, onClose, onConfirm }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Xác Nhận Gửi Phiếu Nhập Kho</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.message}>Bạn có chắc chắn muốn gửi?</Text>
                    </View>

                    {/* Footer / Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Không</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>Đồng ý</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
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
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        content: {
            padding: spacing.lg,
            paddingVertical: spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
        },
        message: {
            fontSize: 14,
            color: theme.text,
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
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        cancelButtonText: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
        },
        confirmButton: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.sm,
            backgroundColor: theme.primary,
        },
        confirmButtonText: {
            fontSize: 14,
            color: '#FFFFFF',
            fontWeight: '400',
        },
    });
