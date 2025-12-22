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

import { TagStatus } from '../Tag';

interface MemberActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onResendInvite: () => void;
  onDelete: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  position: { top: number; right: number };
  status: TagStatus;
}

export const MemberActionMenu: React.FC<MemberActionMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onResendInvite,
  onDelete,
  onSuspend,
  onActivate,
  position,
  status,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.menu, { top: position.top, right: position.right }]}>
            {/* Active Status */}
            {status === 'active' && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                  <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={onSuspend}>
                  <Text style={styles.deleteText}>Tạm ngưng tài khoản</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Paused Status */}
            {status === 'paused' && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                  <Text style={styles.menuText}>Xem thông tin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={onActivate}>
                  <Text style={styles.menuText}>Kích hoạt lại</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Pending Status (Default/Fallback) */}
            {status === 'pending' && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                  <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onResendInvite}>
                  <Text style={styles.menuText}>Gửi lại lời mời</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                  <Text style={styles.deleteText}>Xoá thành viên</Text>
                </TouchableOpacity>
              </>
            )}
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
    ...shadows.md, // Ensure shadows are imported or defined
    paddingVertical: spacing.xs,
    elevation: 5, // Android shadow
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
