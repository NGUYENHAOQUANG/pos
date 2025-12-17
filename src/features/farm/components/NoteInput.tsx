import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '@/styles';

interface NoteInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

const ResizeHandle = () => (
  <View style={localStyles.handleContainer}>
    {/* Đường chéo 1 */}
    <View style={localStyles.line1} />
    {/* Đường chéo 2 */}
    <View style={localStyles.line2} />
  </View>
);

const NoteInput: React.FC<NoteInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Nhập ghi chú',
  containerStyle,
  ...restProps
}) => (
  <View style={[styles.container, containerStyle]}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      multiline
      numberOfLines={6}
      textAlignVertical="top"
      {...restProps}
    />
    <View style={styles.resizeHandleContainer} pointerEvents="none">
      <ResizeHandle />
    </View>
  </View>
);

const HANDLE_THICKNESS = 1.5;
const HANDLE_LENGTH = 10;
const HANDLE_COLOR = '#b3b3b3';

const localStyles = StyleSheet.create({
    handleContainer: {
        width: HANDLE_LENGTH + 2,
        height: HANDLE_LENGTH + 2,
        // Dịch chuyển nhỏ để biểu tượng nằm gọn trong góc
        transform: [{ translateY: 2 }, { translateX: 2 }],
    },
    line1: {
        width: HANDLE_LENGTH * 1,
        height: HANDLE_THICKNESS,
        backgroundColor: HANDLE_COLOR,
        // Xoay và dịch chuyển để tạo đường chéo trên
        transform: [{ rotate: '-45deg' }],
        position: 'absolute',
        bottom: 0,
        right: 0,
        opacity: 0.7,
    },
    line2: {
        width: HANDLE_LENGTH * 1,
        height: HANDLE_THICKNESS,
        backgroundColor: HANDLE_COLOR,
        transform: [{ rotate: '-45deg' }, { translateX: 3 }, { translateY: 3 }],
        position: 'absolute',
        bottom: 0,
        right: 0,
        opacity: 0.7,
    },
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground ?? colors.white,
    minHeight: 80,
    padding: spacing.md,
    justifyContent: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
  },
  resizeHandleContainer: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    opacity: 0.7,
  },
  resizeHandleIcon: {},
});

export default NoteInput;