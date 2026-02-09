import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Platform,
    FlatList,
    Image,
    PermissionsAndroid,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const SPACING = spacing.xs;
const ITEM_SIZE = (width - spacing.lg * 2 - SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface ImagePickerActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onChooseFromLibrary: () => void;
    onImageSelected?: (uri: string, asset?: { fileName?: string; type?: string }) => void;
}

export function ImagePickerActionSheet({
    visible,
    onClose,
    onTakePhoto,
    onChooseFromLibrary,
    onImageSelected,
}: ImagePickerActionSheetProps) {
    const insets = useSafeAreaInsets();
    const [photos, setPhotos] = useState<any[]>([]);
    const [hasPermission, setHasPermission] = useState(false);

    const loadPhotos = React.useCallback(async () => {
        try {
            const result = await CameraRoll.getPhotos({
                first: 32,
                assetType: 'Photos',
            });
            setPhotos(result.edges);
        } catch (error) {
            console.error('Failed to load photos:', error);
        }
    }, []);

    const checkPermissionAndLoadPhotos = React.useCallback(async () => {
        if (Platform.OS === 'android') {
            const permission =
                Platform.Version >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

            const hasPermission = await PermissionsAndroid.check(permission);
            if (hasPermission) {
                setHasPermission(true);
                loadPhotos();
            } else {
                const status = await PermissionsAndroid.request(permission);
                if (status === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasPermission(true);
                    loadPhotos();
                } else {
                    setHasPermission(false);
                }
            }
        } else {
            setHasPermission(true);
            loadPhotos();
        }
    }, [loadPhotos]);

    useEffect(() => {
        if (visible) {
            checkPermissionAndLoadPhotos();
        }
    }, [visible, checkPermissionAndLoadPhotos]);

    const normalizeAsset = (uri: string, filename?: string | null, type?: string | null) => {
        let mimeType = type;
        let name = filename || uri.split('/').pop() || `image-${Date.now()}`;

        // Attempt to infer mimeType from URI or fileName if missing
        if (!mimeType) {
            const lowerUri = uri.toLowerCase();
            const lowerName = name.toLowerCase();
            if (lowerUri.endsWith('.png') || lowerName.endsWith('.png')) mimeType = 'image/png';
            else if (lowerUri.endsWith('.gif') || lowerName.endsWith('.gif'))
                mimeType = 'image/gif';
            else if (lowerUri.endsWith('.webp') || lowerName.endsWith('.webp'))
                mimeType = 'image/webp';
            else mimeType = 'image/jpeg';
        }

        // Ensure extension exists and matches mimeType
        const hasExtension = name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
        if (!hasExtension) {
            const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1] || 'jpg';
            name = `${name}.${ext}`;
        }

        return {
            fileName: name,
            type: mimeType,
        };
    };

    const handlePhotoSelect = (uri: string, asset?: { fileName?: string; type?: string }) => {
        onClose();
        setTimeout(() => {
            if (onImageSelected) {
                // If asset is provided (from quick select), normalize it.
                // If not (fallback?), we might not have info, but here we usually have it from renderItem.
                // Actually handlePhotoSelect is called with (uri, {fileName, type}) from renderItem.
                const normalized = asset
                    ? normalizeAsset(uri, asset.fileName, asset.type)
                    : undefined;
                onImageSelected(uri, normalized);
            } else {
                onChooseFromLibrary();
            }
        }, 300);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.indicator} />
            <Text style={styles.title}>Chọn ảnh</Text>
        </View>
    );

    const renderItem = ({ item }: { item: any; index: number }) => {
        if (item.isCamera) {
            return (
                <TouchableOpacity
                    style={[styles.photoItem, styles.cameraItem]}
                    onPress={() => {
                        onClose();
                        setTimeout(() => onTakePhoto(), 300);
                    }}
                >
                    <Ionicons name="camera" size={32} color={colors.black} />
                    <Text style={styles.cameraText}>Chụp ảnh</Text>
                </TouchableOpacity>
            );
        }

        if (item.isLibrary) {
            return (
                <TouchableOpacity
                    style={[
                        styles.photoItem,
                        styles.cameraItem,
                        { backgroundColor: colors.gray[100] },
                    ]}
                    onPress={() => {
                        onClose();
                        setTimeout(() => onChooseFromLibrary(), 300);
                    }}
                >
                    <Ionicons name="images" size={32} color={colors.black} />
                    <Text style={styles.cameraText}>Thư viện</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.photoItem}
                onPress={() =>
                    handlePhotoSelect(item.node.image.uri, {
                        fileName: item.node.image.filename,
                        type: item.node.type,
                    })
                }
            >
                <Image source={{ uri: item.node.image.uri }} style={styles.photo} />
            </TouchableOpacity>
        );
    };

    const data = [{ isCamera: true }, { isLibrary: true }, ...photos];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
                    <View style={styles.card}>
                        {renderHeader()}

                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) =>
                                item.isCamera
                                    ? 'camera'
                                    : item.isLibrary
                                    ? 'library'
                                    : item.node?.image?.uri + index
                            }
                            numColumns={COLUMN_COUNT}
                            columnWrapperStyle={styles.columnWrapper}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            style={styles.flatList}
                            ListFooterComponent={
                                !hasPermission ? (
                                    <View
                                        style={[
                                            styles.permissionContainer,
                                            { marginBottom: Math.max(insets.bottom, spacing.md) },
                                        ]}
                                    >
                                        <Text style={styles.permissionText}>
                                            Cần quyền truy cập thư viện ảnh để hiển thị ảnh gần đây.
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.permissionButton}
                                            onPress={checkPermissionAndLoadPhotos}
                                        >
                                            <Text style={styles.permissionButtonText}>
                                                Cấp quyền
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{ height: Math.max(insets.bottom, spacing.md) }} />
                                )
                            }
                        />
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
    container: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.sm,
        maxHeight: '80%',
        width: '100%',
        overflow: 'hidden',
    },
    header: {
        alignItems: 'center',
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    flatList: {
        flexGrow: 0,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl * 2,
    },
    columnWrapper: {
        gap: SPACING,
        marginBottom: SPACING,
    },
    photoItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.gray[100],
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    cameraItem: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
    },
    cameraText: {
        marginTop: spacing.xs,
        fontSize: 12,
        color: colors.black,
        fontWeight: '500',
    },

    permissionContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },
    permissionText: {
        textAlign: 'center',
        color: colors.text,
    },
    permissionButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
    },
    permissionButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});
