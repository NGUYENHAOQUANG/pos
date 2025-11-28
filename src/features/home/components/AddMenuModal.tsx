import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, sizes } from '@/styles';

interface AddMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFarm: () => void;
  onCreatePond: () => void;
  onCreateQuickFarm: () => void;
}

export const AddMenuModal: React.FC<AddMenuModalProps> = ({
  visible,
  onClose,
  onCreateFarm,
  onCreatePond,
  onCreateQuickFarm,
}) => {
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      icon: "location-outline" as const,
      title: "Tạo vùng nuôi",
      onPress: onCreateFarm,
    },
    {
      icon: "water-outline" as const,
      title: "Tạo ao",
      onPress: onCreatePond,
    },
    {
      icon: "add-circle-outline" as const,
      title: "Tạo nhanh trại nuôi",
      onPress: onCreateQuickFarm,
    },
  ];

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleMenuItemPress = (itemOnPress: () => void) => {
    itemOnPress();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
      >
        <Pressable
          style={[
            styles.menuContent,
            { paddingBottom: Math.max(insets.bottom, spacing.md) }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Custom Header with Close Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={sizes.icon.sm} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuItemPress(item.onPress)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={sizes.icon.sm} color={colors.text} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.full,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 'auto',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
});
