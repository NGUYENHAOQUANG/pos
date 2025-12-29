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

interface FarmActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onFarmInfo: () => void;
  position?: { top: number; right: number };
}

export const FarmActionMenu: React.FC<FarmActionMenuProps> = ({
  visible,
  onClose,
  onFarmInfo,
  position = { top: 60, right: 16 },
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
            <TouchableOpacity style={styles.menuItem} onPress={onFarmInfo}>
              <Text style={styles.menuText}>Thông tin trại</Text>
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
});
