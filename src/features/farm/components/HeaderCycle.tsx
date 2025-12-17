import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '@/styles';
import TrashIcon from '@/assets/images/Icon/IconDevices/TrashOutlined.svg';
import { ConfirmationDeleteCycleModal } from './ConfirmationDeleteCycleModal';
interface Props {
  title: string;
  onBack: () => void;
  isEdit: boolean;
  onDelete?: () => void;
}

const ICON_SIZE = 24;
const TOUCH_SIZE = 40;

const HeaderCycle: React.FC<Props> = ({ title, onBack, isEdit, onDelete }) => {
  const insets = useSafeAreaInsets();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalVisible(false);
    if (onDelete) {
      onDelete();
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={8}>
        <Ionicons name="arrow-back" size={ICON_SIZE} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Nút Xóa/Placeholder (Bên phải) */}
      <View style={styles.rightContent}>
        {isEdit && onDelete ? (
          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.deleteButton}
            hitSlop={8}
          >
            <TrashIcon width={ICON_SIZE} height={ICON_SIZE} fill={colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <ConfirmationDeleteCycleModal
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={() => {
          setIsDeleteModalVisible(false);
          onDelete?.(); // Thực hiện xóa khi bấm Đồng ý
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: TOUCH_SIZE + spacing.sm,
    zIndex: 1000,
  },
  backButton: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  iconButton: {
    minWidth: TOUCH_SIZE,
    minHeight: TOUCH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  deleteButton: {
      width: TOUCH_SIZE,
      height: TOUCH_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.error,
    },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  rightContent: {
    width: TOUCH_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
  },
});

export default HeaderCycle;