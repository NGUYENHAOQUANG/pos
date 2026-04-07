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
import { useAppTheme } from '@/styles/themeContext';
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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

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
            containerStyle={themedStyles.sheetContainer}
        >
            {/* Indicator */}
            <View style={themedStyles.indicator} />

            {/* Title */}
            <Text style={themedStyles.title}>Chụp hoặc chọn ảnh thiết bị</Text>

            {/* Options */}
            <View style={themedStyles.content}>
                <TouchableOpacity
                    style={themedStyles.optionButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                >
                    <View style={themedStyles.iconContainer}>
                        <Ionicons name="camera" size={22} color={theme.text} />
                    </View>
                    <Text style={themedStyles.optionText}>Chụp ảnh mới</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <View style={themedStyles.divider} />

                <TouchableOpacity
                    style={themedStyles.optionButton}
                    onPress={handleChooseLibrary}
                    activeOpacity={0.7}
                >
                    <View style={themedStyles.iconContainer}>
                        <Ionicons name="images" size={22} color={theme.text} />
                    </View>
                    <Text style={themedStyles.optionText}>Chọn từ thư viện</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Close button */}
            <View style={themedStyles.footer}>
                <Button title="Đóng" variant="outline" onPress={onClose} />
            </View>
        </AnimatedBottomSheet>
    );
}

const getStyles = (theme: ReturnType<typeof useAppTheme>) =>
    StyleSheet.create({
        sheetContainer: {
            borderRadius: 24,
            margin: 16,
            paddingBottom: 24,
            padding: spacing.md,
            backgroundColor: theme.background,
        },
        indicator: {
            width: 40,
            height: 4,
            backgroundColor: theme.isDark ? theme.border : colors.gray[300],
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: spacing.sm,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
            paddingVertical: spacing.md,
        },
        content: {
            borderWidth: 1,
            borderColor: theme.border,
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
            backgroundColor: theme.backgroundSecondary,
        },
        optionText: {
            flex: 1,
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        divider: {
            height: 1,
            backgroundColor: theme.border,
        },
        footer: {
            paddingTop: spacing.md,
        },
    });
