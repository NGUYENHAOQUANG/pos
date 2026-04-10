import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    PermissionsAndroid,
    Alert,
} from 'react-native';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    MediaType,
    Asset,
} from 'react-native-image-picker';

import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { IconCloseOutlined } from '@/assets/icons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, colors as legacyColors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { APP_CONFIG } from '@/shared/constants/config';
import { showImageSizeExceededToast } from '@/features/farm/utils/toastMessages';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { ImagePreviewModal } from '@/features/farm/components/pondwork/shrimp-inspection/ImagePreviewModal';

const IMAGE_GAP = spacing.xs;
const MAX_TOTAL_IMAGE_SIZE_BYTES = APP_CONFIG.IMAGE_SIZE_LIMIT_BYTES;

interface ImageItemProps {
    uri: string;
    index: number;
    imageSize: number;
    theme: Colors;
    onPreview: (uri: string) => void;
    onRemove: (index: number) => void;
}

const ImageItem = ({ uri, index, imageSize, theme, onPreview, onRemove }: ImageItemProps) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <View style={[stylesLocal.imageItem, { width: imageSize, height: imageSize }]}>
            <TouchableOpacity
                style={stylesLocal.imageInner}
                activeOpacity={0.9}
                onPress={() => onPreview(uri)}
            >
                {isLoading && (
                    <View style={StyleSheet.absoluteFill}>
                        <Skeleton width="100%" height={imageSize} borderRadius={borderRadius.sm} />
                    </View>
                )}
                <Image
                    source={{ uri }}
                    style={[stylesLocal.image, isLoading && { opacity: 0 }]}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={stylesLocal.removeButton}
                onPress={() => onRemove(index)}
                activeOpacity={0.7}
            >
                <IconCloseOutlined width={12} height={12} color={theme.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};

export interface ImageSectionProps {
    imageUris?: string[];
    onImagesChange?: (uris: string[], addedAsset?: Asset) => void;
}

export const ImageSection = ({ imageUris = [], onImagesChange }: ImageSectionProps) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [gridWidth, setGridWidth] = useState(0);
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const requestCameraPermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Quyền truy cập camera',
                        message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh',
                        buttonNeutral: 'Để sau',
                        buttonNegative: 'Hủy',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch {
                return false;
            }
        }
        return true;
    };

    const handleAddFile = (asset: Asset) => {
        if (!asset.uri) return;
        const sizeBytes = asset.fileSize ?? 0;

        if (sizeBytes > 0 && sizeBytes > MAX_TOTAL_IMAGE_SIZE_BYTES) {
            showImageSizeExceededToast();
            return;
        }

        const newUris = [...imageUris, asset.uri];
        onImagesChange?.(newUris, asset);
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Thông báo', 'Cần quyền truy cập camera để chụp ảnh');
            return;
        }

        launchCamera(
            {
                mediaType: 'photo' as MediaType,
                quality: 0.8,
                saveToPhotos: true,
                includeExtra: true,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) return;
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets[0]) {
                    handleAddFile(response.assets[0]);
                }
            }
        );
    };

    const handleChooseFromLibrary = () => {
        launchImageLibrary(
            {
                mediaType: 'photo' as MediaType,
                quality: 0.8,
                selectionLimit: 0,
                includeExtra: true,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) return;
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    let hasExceededSize = false;
                    const validAssets = response.assets.filter(asset => {
                        const sizeBytes = asset.fileSize ?? 0;
                        if (sizeBytes > 0 && sizeBytes > MAX_TOTAL_IMAGE_SIZE_BYTES) {
                            hasExceededSize = true;
                            return false;
                        }
                        return true;
                    });

                    if (hasExceededSize) {
                        showImageSizeExceededToast();
                    }

                    if (validAssets.length > 0) {
                        const newValidUris = validAssets
                            .map(a => a.uri)
                            .filter(Boolean) as string[];
                        onImagesChange?.([...imageUris, ...newValidUris]);
                    }
                }
            }
        );
    };

    const handleRemoveImage = (index: number) => {
        const newUris = imageUris.filter((_, i) => i !== index);
        onImagesChange?.(newUris);
    };

    const handlePreviewImage = (uri: string) => {
        setPreviewUri(uri);
        setPreviewVisible(true);
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Hình ảnh</Text>

            <Button
                title="Thêm hình ảnh"
                variant="outline"
                onPress={() => setActionSheetVisible(true)}
                iconLeft="add"
                fullWidth
            />

            {imageUris.length > 0 && (
                <View
                    style={styles.imagesGrid}
                    onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
                >
                    {imageUris.map((uri, index) => {
                        const imageSize =
                            gridWidth > 0 ? Math.floor((gridWidth - IMAGE_GAP * 3) / 4) : 70;
                        return (
                            <ImageItem
                                key={`${uri}-${index}`}
                                uri={uri}
                                index={index}
                                imageSize={imageSize}
                                theme={theme}
                                onPreview={handlePreviewImage}
                                onRemove={handleRemoveImage}
                            />
                        );
                    })}
                </View>
            )}

            <ImagePickerActionSheet
                visible={actionSheetVisible}
                onClose={() => setActionSheetVisible(false)}
                onTakePhoto={handleTakePhoto}
                onChooseFromLibrary={handleChooseFromLibrary}
                onImageSelected={(uri, asset) => handleAddFile({ uri, ...asset } as Asset)}
            />

            <ImagePreviewModal
                visible={previewVisible}
                imageUri={previewUri}
                onClose={() => setPreviewVisible(false)}
            />
        </View>
    );
};

const stylesLocal = StyleSheet.create({
    imageItem: {
        borderRadius: borderRadius.sm,
        overflow: 'visible',
        position: 'relative',
    },
    imageInner: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        zIndex: 10,
    },
});

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        inputGroup: { gap: spacing.sm },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 22,
        },
        imagesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: IMAGE_GAP,
            marginTop: spacing.xs,
        },
        imageItem: {
            borderRadius: borderRadius.sm,
            overflow: 'visible',
            position: 'relative',
        },
        imageInner: {
            width: '100%',
            height: '100%',
            borderRadius: borderRadius.sm,
            overflow: 'hidden',
            backgroundColor: theme.background,
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        removeButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: legacyColors.borderLight || theme.defaultBorder,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
    });
