import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius, shadows } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface DeviceActionMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onMaintain: () => void;
    onViewHistory: () => void;
    onDelete: () => void;
    position: { top?: number; bottom?: number; right: number };
}

export const DeviceActionMenu: React.FC<DeviceActionMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onMaintain,
    onViewHistory,
    onDelete,
    position,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onDismiss={onClose}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View
                        style={[
                            styles.menu,
                            { right: position.right },
                            position.top !== undefined ? { top: position.top } : {},
                            position.bottom !== undefined ? { bottom: position.bottom } : {},
                        ]}
                    >
                        <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                            <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={onMaintain}>
                            <Text style={styles.menuText}>Bảo trì thiết bị</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={onViewHistory}>
                            <Text style={styles.menuText}>Xem lịch sử thiết bị</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                            <Text style={styles.deleteText}>Xoá thiết bị</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        menu: {
            position: 'absolute',
            width: 200,
            backgroundColor: theme.white,
            borderRadius: borderRadius.md,
            ...shadows.md,
            paddingVertical: spacing.xs,
            elevation: 5,
        },
        menuItem: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
        },
        menuText: {
            fontSize: 14,
            color: theme.text,
        },
        deleteText: {
            fontSize: 14,
            color: theme.error,
        },
    });
