import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    Asset,
} from 'react-native-image-picker';
import { colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { Button } from '@/shared/components/buttons/Button';

interface ImagePickerActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto?: () => void;
    onChooseFromLibrary?: () => void;
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
                        selectionLimit: 1,
                    });
                    handleResponse(result);
                }
            },
            Platform.OS === 'ios' ? 400 : 0
        );
    };

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={styles.sheetContainer}
        >
            {/* Indicator */}
            <View style={styles.indicator} />

            {/* Title */}
            <Text style={styles.title}>Chụp hoặc chọn ảnh thiết bị</Text>

            {/* Options */}
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.optionButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="camera" size={22} color={colors.text} />
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
                    <View style={styles.iconContainer}>
                        <Ionicons name="images" size={22} color={colors.text} />
                    </View>
                    <Text style={styles.optionText}>Chọn từ thư viện</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
            </View>

            {/* Close button */}
            <View style={styles.footer}>
                <Button title="Đóng" variant="outline" onPress={onClose} />
            </View>
        </AnimatedBottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        borderRadius: 24,
        margin: 16,
        paddingBottom: 24,
        padding: spacing.md,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
    content: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
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
        backgroundColor: colors.gray[100],
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
    },
    footer: {
        paddingTop: spacing.md,
    },
});
