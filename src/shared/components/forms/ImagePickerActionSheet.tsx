/**
 * @file ImagePickerActionSheet.tsx
 * @description Action sheet for image picker options using Ant Design theme
 * @author Auto
 * @created 2025-01-27
 * @updated 2025-01-27 - Applied Ant Design theme styling
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, borderRadius, typography} from '@/styles';
import {antdTheme} from '@/core/config/antd-theme';

interface ImagePickerActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
}

export function ImagePickerActionSheet({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
}: ImagePickerActionSheetProps) {
  const insets = useSafeAreaInsets();

  const handleTakePhoto = () => {
    onTakePhoto();
    onClose();
  };

  const handleChooseFromLibrary = () => {
    onChooseFromLibrary();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            {paddingBottom: Math.max(insets.bottom, spacing.md)},
          ]}
          onPress={e => e.stopPropagation()}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Thêm ảnh</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}>
              <Text style={styles.optionText}>Chụp ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleChooseFromLibrary}
              activeOpacity={0.7}>
              <Text style={styles.optionText}>Thư viện ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: antdTheme.fill_mask || 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: antdTheme.fill_base || colors.white,
    borderTopLeftRadius: antdTheme.radius_lg || borderRadius.xl,
    borderTopRightRadius: antdTheme.radius_lg || borderRadius.xl,
    paddingTop: antdTheme.v_spacing_md || spacing.md,
    paddingHorizontal: antdTheme.h_spacing_lg || spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  titleContainer: {
    paddingVertical: antdTheme.v_spacing_md || spacing.md,
    borderBottomWidth: antdTheme.border_width_md || 1,
    borderBottomColor: antdTheme.border_color_base || colors.borderLight,
    marginBottom: antdTheme.v_spacing_md || spacing.md,
  },
  title: {
    fontSize: antdTheme.font_size_heading || typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: antdTheme.color_text_base || colors.text,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: antdTheme.v_spacing_sm || spacing.sm,
    marginBottom: antdTheme.v_spacing_md || spacing.md,
  },
  optionButton: {
    backgroundColor: colors.primary,
    paddingVertical: antdTheme.v_spacing_md || spacing.md,
    paddingHorizontal: antdTheme.h_spacing_lg || spacing.lg,
    borderRadius: antdTheme.radius_md || borderRadius.md,
    alignItems: 'center',
    marginBottom: antdTheme.v_spacing_sm || spacing.sm,
  },
  optionText: {
    fontSize: antdTheme.font_size_base || typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: antdTheme.border_width_md || 1,
    borderColor: colors.primary,
    paddingVertical: antdTheme.v_spacing_md || spacing.md,
    paddingHorizontal: antdTheme.h_spacing_lg || spacing.lg,
    borderRadius: antdTheme.radius_md || borderRadius.md,
    alignItems: 'center',
    marginTop: antdTheme.v_spacing_sm || spacing.sm,
    marginBottom: antdTheme.v_spacing_md || spacing.md,
  },
  cancelText: {
    fontSize: antdTheme.font_size_base || typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
});
