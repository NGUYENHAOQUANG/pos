import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    Asset,
} from 'react-native-image-picker';
import { colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ImagePickerActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto?: () => void; // Keeping for compatibility, though we might handle it internally
    onChooseFromLibrary?: () => void; // Keeping for compatibility
    onImageSelected?: (
        uri: string,
        asset?: { fileName?: string; type?: string; width?: number; height?: number }
    ) => void;
}

export function ImagePickerActionSheet({
    visible,
    onClose,
    onTakePhoto,
    onChooseFromLibrary,
    onImageSelected,
}: ImagePickerActionSheetProps) {
    const insets = useSafeAreaInsets();

    const handleResponse = (response: ImagePickerResponse) => {
        if (response.didCancel) {
            // User cancelled image picker
        } else if (response.errorCode) {
            console.error('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
            const asset: Asset = response.assets[0];
            if (asset.uri && onImageSelected) {
                onImageSelected(asset.uri, {
                    fileName: asset.fileName,
                    type: asset.type,
                    width: asset.width,
                    height: asset.height,
                });
            }
        }
    };

    const handleTakePhoto = () => {
        onClose();
        setTimeout(
            async () => {
                if (onTakePhoto) {
                    onTakePhoto();
                } else {
                    const result = await launchCamera({
                        mediaType: 'photo',
                        quality: 0.8,
                        saveToPhotos: true,
                    });
                    handleResponse(result);
                }
            },
            Platform.OS === 'ios' ? 400 : 0
        );
    };

    const handleChooseLibrary = () => {
        onClose();
        setTimeout(
            async () => {
                if (onChooseFromLibrary) {
                    onChooseFromLibrary();
                } else {
                    const result = await launchImageLibrary({
                        mediaType: 'photo',
                        quality: 0.8,
                        selectionLimit: 1, // Single image selection
                    });
                    handleResponse(result);
                }
            },
            Platform.OS === 'ios' ? 400 : 0
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable
                    style={[styles.card, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
                    onPress={e => e.stopPropagation()}
                >
                    <View style={styles.header}>
                        <View style={styles.indicator} />
                        <Text style={styles.title}>Chọn ảnh thiết bị</Text>
                    </View>

                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleTakePhoto}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.primary + '15' },
                                ]}
                            >
                                <Ionicons name="camera" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Chụp ảnh mới</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleChooseLibrary}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.info + '15' },
                                ]}
                            >
                                <Ionicons name="images" size={24} color={colors.info} />
                            </View>
                            <Text style={styles.optionText}>Chọn từ thư viện</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.sm,
        width: '100%',
        overflow: 'hidden',
    },
    header: {
        alignItems: 'center',
        paddingBottom: spacing.lg,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginLeft: 60, // Align with text
    },
});
