import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/styles';

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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menu: {
        position: 'absolute',
        width: 200,
        backgroundColor: colors.white,
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
        color: colors.text,
    },
    deleteText: {
        fontSize: 14,
        color: colors.error,
    },
});
