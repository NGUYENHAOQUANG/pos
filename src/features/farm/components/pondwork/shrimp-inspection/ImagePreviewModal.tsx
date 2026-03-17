import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '@/styles';

/**
 * Props for ImagePreviewModal component
 */
interface ImagePreviewModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** URI of the image to display. If null, no image is shown */
    imageUri: string | null;
    /** Callback function called when user closes the modal */
    onClose: () => void;
    /** Text for the close button (default: 'Đóng') */
    closeButtonText?: string;
}

/**
 * A full-screen modal component for previewing images.
 *
 * Displays an image in full-screen with a semi-transparent dark backdrop.
 * Includes a close button at the bottom that respects safe area insets.
 *
 * @example
 * ```tsx
 * <ImagePreviewModal
 *   visible={isVisible}
 *   imageUri={selectedImageUri}
 *   onClose={handleClose}
 *   closeButtonText="Đóng"
 * />
 * ```
 */
export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    visible,
    imageUri,
    onClose,
    closeButtonText = 'Đóng',
}) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.container}>
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ) : null}
                    <TouchableOpacity
                        style={[
                            styles.closeButton,
                            {
                                bottom: insets.bottom + spacing.sm,
                            },
                        ]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.closeButtonText}>{closeButtonText}</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlayLight,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        bottom: 6,
        left: spacing.md,
        right: spacing.md,
        height: 48,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderMedium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
    },
});
