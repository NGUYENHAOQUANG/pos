import React from 'react';
import Toast from 'react-native-toast-message';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { IconWarning } from '@/assets/icons';

/**
 * Props for ConfirmationDeleteModal component
 */
interface ConfirmationDeleteModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback function called when user confirms deletion */
  onConfirm: () => void;
  /** Callback function called when user cancels deletion */
  onCancel: () => void;
  /** Title text displayed in the modal (default: 'Xoá tác vụ') */
  title?: string;
  /** Message text displayed in the modal (default: 'Bạn có chắc chắn muốn xoá tác vụ này không?') */
  message?: string;
  /** Text for the confirm button (default: 'Đồng ý') */
  confirmText?: string;
  /** Text for the cancel button (default: 'Không') */
  /** Text for the cancel button (default: 'Không') */
  cancelText?: string;
  /** Toast message on success (default: 'Đã xóa tác vụ thành công') */
  successMessage?: string;
}

/**
 * A reusable modal component for confirming deletion actions.
 *
 * Displays a warning icon, title, message, and two action buttons (cancel and confirm).
 * The confirm button has a red background to indicate a destructive action.
 */
export const ConfirmationDeleteModal: React.FC<ConfirmationDeleteModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Xoá tác vụ',
  message = 'Bạn có chắc chắn muốn xoá tác vụ này không?',
  confirmText = 'Đồng ý',
  cancelText = 'Không',
  successMessage = 'Đã xóa tác vụ thành công',
}) => {
  const handleConfirm = () => {
    onConfirm();
    Toast.show({
      type: 'success',
      text1: successMessage,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.content}>
                {/* Row: Icon, Column(title, message, buttons) */}
                <View style={styles.mainRow}>
                  {/* Icon */}
                  <IconWarning width={21} height={21} style={styles.warningIcon} />

                  {/* Column: Title, Message, Buttons */}
                  <View style={styles.column}>
                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons Row */}
                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 341,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  warningIcon: {
    margin: 3,
  },
  column: {
    flex: 1,
  },
  title: {
    fontFamily: 'Nunito Sans',
    fontWeight: '700',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: 'Nunito Sans',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    alignItems: 'flex-end',
    marginTop: spacing.sm,
    height: 48,
  },
  cancelButton: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#DEE4ED',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  confirmButton: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FF4D4F',
    backgroundColor: '#FF4D4F',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 22,
  },
});
