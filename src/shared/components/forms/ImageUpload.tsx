/**
 * @file ImageUpload.tsx
 * @description Image upload component with action sheet
 * @author Auto
 * @created 2025-01-27
 */
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image as RNImage,
    ViewStyle,
    Platform,
    PermissionsAndroid,
    Alert,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    MediaType,
    Asset,
} from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, sizes } from '@/styles';
import { ImagePickerActionSheet } from './ImagePickerActionSheet';

interface ImageUploadProps {
    imageUri?: string | null;
    onImageSelect?: (
        uri: string,
        base64?: string,
        file?: { fileName: string; type: string },
        dimensions?: { width: number; height: number }
    ) => void;
    onImageRemove?: () => void;
    style?: ViewStyle;
    label?: string;
    returnBase64?: boolean;
    aspectRatio?: number;
    children?: React.ReactNode;
    customEmptyState?: React.ReactNode | ((openPicker: () => void) => React.ReactNode);
    bottomContent?: React.ReactNode | ((openPicker: () => void) => React.ReactNode);
    uploadStyle?: ViewStyle;
    disablePressContainer?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ImageUpload({
    imageUri,
    onImageSelect,
    onImageRemove,
    style,
    label,
    returnBase64 = false,
    aspectRatio,
    children,
    customEmptyState,
    bottomContent,
    uploadStyle,
    disablePressContainer = false,
}: ImageUploadProps) {
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const processImage = async (asset: Asset & { fileName?: string; type?: string }) => {
        try {
            setIsProcessing(true);
            if (!asset.uri) return;

            let isPhAsset = asset.uri.startsWith('ph://');
            let finalUri = asset.uri;
            let fileSize = asset.fileSize;

            if (!fileSize && !isPhAsset) {
                try {
                    const stat = await RNFS.stat(asset.uri);
                    fileSize = Number(stat.size);
                } catch (error) {
                    console.warn('Cannot stat file for size check', error);
                }
            }
            fileSize = fileSize || 0;

            if (isPhAsset || fileSize > MAX_FILE_SIZE) {
                const compressConfig = isPhAsset
                    ? {
                          compressionMethod: 'auto',
                          maxWidth: 30000,
                          maxHeight: 30000,
                          quality: 0.9,
                      }
                    : {
                          compressionMethod: 'auto',
                      };

                finalUri = await ImageCompressor.compress(asset.uri, compressConfig as any);
            }

            let base64String: string | undefined;
            if (returnBase64) {
                base64String = await RNFS.readFile(finalUri, 'base64');
            }

            // Asset passed here might come from ImagePickerActionSheet (normalized) or ImagePicker (raw)
            // If raw, we might need fallback, but ImagePickerActionSheet should normalize it.
            // However, processImage is also called by handleResponse (camera/library).

            const fileName = asset.fileName || finalUri.split('/').pop() || 'image.jpg';
            const type = asset.type || 'image/jpeg';
            const dimensions =
                asset.width && asset.height
                    ? { width: asset.width, height: asset.height }
                    : undefined;

            onImageSelect?.(finalUri, base64String, { fileName, type }, dimensions);
        } catch (error) {
            console.error('Error processing image:', error);
            Alert.alert('Lỗi', 'Không thể xử lý ảnh này, vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResponse = (response: ImagePickerResponse) => {
        if (response.didCancel) {
            return;
        }
        if (response.errorMessage) {
            Alert.alert('Lỗi', response.errorMessage);
            return;
        }
        if (response.assets && response.assets[0]) {
            processImage(response.assets[0]);
        }
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
            },
            handleResponse
        );
    };

    const handleChooseFromLibrary = () => {
        launchImageLibrary(
            {
                mediaType: 'photo' as MediaType,
                quality: 0.8,
            },
            handleResponse
        );
    };

    const handleImagePress = () => {
        if (isProcessing) return;

        if (imageUri) {
            setActionSheetVisible(true);
        } else {
            setActionSheetVisible(true);
        }
    };

    const renderContent = () => {
        if (imageUri) {
            return (
                <View style={styles.imageContainer}>
                    <RNImage source={{ uri: imageUri }} style={styles.image} />
                    {children}
                </View>
            );
        }

        if (customEmptyState) {
            if (isProcessing) {
                return (
                    <View style={styles.placeholderContainer}>
                        <Ionicons
                            name={'hourglass-outline'}
                            size={sizes.icon['2xl']}
                            color={colors.textSecondary}
                        />
                        <Text style={styles.processingText}>Đang xử lý...</Text>
                    </View>
                );
            }
            return typeof customEmptyState === 'function'
                ? customEmptyState(handleImagePress)
                : customEmptyState;
        }

        return (
            <View style={styles.placeholderContainer}>
                <Ionicons
                    name={isProcessing ? 'hourglass-outline' : 'image-outline'}
                    size={sizes.icon['2xl']}
                    color={colors.textSecondary}
                />
                {!isProcessing && (
                    <Ionicons
                        name="add-circle"
                        size={sizes.icon.lg}
                        color={colors.textSecondary}
                        style={styles.addIcon}
                    />
                )}
                {isProcessing && <Text style={styles.processingText}>Đang xử lý...</Text>}
            </View>
        );
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.headerRow}>
                {label && <Text style={styles.label}>{label}</Text>}
                {imageUri && onImageRemove && (
                    <TouchableOpacity
                        onPress={onImageRemove}
                        activeOpacity={0.7}
                        style={styles.textDeleteButton}
                    >
                        <Text style={styles.textDelete}>Gỡ ảnh</Text>
                    </TouchableOpacity>
                )}
            </View>

            {disablePressContainer ? (
                <View
                    style={[
                        styles.uploadContainer,
                        isProcessing && styles.disabledContainer,
                        aspectRatio ? { aspectRatio } : undefined,
                        uploadStyle,
                    ]}
                >
                    {renderContent()}
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.uploadContainer,
                        isProcessing && styles.disabledContainer,
                        aspectRatio ? { aspectRatio } : undefined,
                        uploadStyle,
                    ]}
                    onPress={handleImagePress}
                    disabled={isProcessing}
                    activeOpacity={0.7}
                >
                    {renderContent()}
                </TouchableOpacity>
            )}

            {bottomContent &&
                (typeof bottomContent === 'function'
                    ? bottomContent(handleImagePress)
                    : bottomContent)}

            <ImagePickerActionSheet
                visible={actionSheetVisible}
                onClose={() => setActionSheetVisible(false)}
                onTakePhoto={handleTakePhoto}
                onChooseFromLibrary={handleChooseFromLibrary}
                onImageSelected={(uri, asset) => {
                    processImage({
                        uri,
                        fileName: asset?.fileName,
                        type: asset?.type,
                        width: asset?.width,
                        height: asset?.height,
                    });
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },
    textDeleteButton: {
        paddingHorizontal: spacing.sm,
    },
    textDelete: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
        fontWeight: typography.fontWeight.medium,
        marginRight: spacing.sm,
    },
    uploadContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    disabledContainer: {
        opacity: 0.7,
        backgroundColor: colors.gray[200],
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    addIcon: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
    },
    processingText: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
    },
});
