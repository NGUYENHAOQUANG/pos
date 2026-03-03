import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    PermissionsAndroid,
    Alert,
    ActivityIndicator,
} from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    MediaType,
    Asset,
} from 'react-native-image-picker';
import { documentApi } from '@/features/material/api/documentApi';

export interface GeneralInfoBoxRef {
    markAsSaved: () => void;
    getUploadedIds: () => string[];
}

import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconCloseOutlined } from '@/assets/icons';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { ImagePreviewModal } from '@/features/farm/components/pondwork/shrimp-inspection/ImagePreviewModal';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';

type GeneralInfoBoxType = 'default' | 'withImage' | 'water_treatment' | 'harvest';

/**
 * GeneralInfoBox Component
 *
 * A reusable component for displaying general information fields including:
 * - Date/time picker
 * - Activity type selection (radio buttons) for water_treatment and harvest
 * - Image picker (for withImage and harvest types)
 *
 * @example
 * // Default type - only date picker
 * <GeneralInfoBox
 *   type="default"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 * />
 *
 * @example
 * // With image support
 * <GeneralInfoBox
 *   type="withImage"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   imageUris={imageUris}
 *   onImagesChange={setImageUris}
 * />
 *
 * @example
 * // Water treatment type - with activity selection
 * <GeneralInfoBox
 *   type="water_treatment"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   activityLabel="Chọn loại xử lý nước"
 *   activityOptions={['Xử lý hóa chất', 'Xử lý vi sinh', 'Xử lý khác']}
 *   selectedActivity={selectedTreatment}
 *   onSelectActivity={setSelectedTreatment}
 * />
 *
 * @example
 * // Harvest type - with activity selection (no image)
 * <GeneralInfoBox
 *   type="harvest"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   activityLabel="Chọn loại thu hoạch"
 *   activityOptions={['Thu hết', 'Thu tỉa', 'Đóng chu kỳ']}
 *   selectedActivity={harvestType}
 *   onSelectActivity={setHarvestType}
 * />
 */
interface GeneralInfoBox {
    type?: GeneralInfoBoxType;
    date?: Date; // Initial date (for edit mode)
    onDateChange?: (date: Date) => void; // Callback when date changes
    imageUris?: string[]; // Initial images (for edit mode) - used for 'withImage' and 'harvest' types
    onImagesChange?: (images: string[]) => void; // Callback when images change
    // Optional initial mapping from document IDs to image URIs (index-based)
    documentIds?: string[];
    activityLabel?: string; // Label for activity selection (e.g., "Chọn loại thu hoạch")
    activityOptions?: string[]; // Options for activity selection (radio buttons)
    selectedActivity?: string; // Currently selected activity option
    onSelectActivity?: (val: string) => void; // Callback when activity is selected
    disabledDate?: boolean;
}

export const GeneralInfoBox = React.forwardRef<GeneralInfoBoxRef, GeneralInfoBox>(
    (
        {
            type = 'default',
            date: initialDate,
            onDateChange,
            imageUris: initialImageUris,
            onImagesChange,
            documentIds: initialDocumentIds,
            activityLabel = 'Chọn loại hoạt động',
            activityOptions,
            selectedActivity,
            onSelectActivity,
            disabledDate = false,
        },
        ref
    ) => {
        // Internal state for date
        const initialDateValue = useRef<Date>(initialDate || new Date());
        const [selectedDate, setSelectedDate] = useState<Date>(initialDateValue.current);

        // Track if date has been changed from initial value
        const [hasDateChanged, setHasDateChanged] = useState(false);

        // Internal state for images
        const [imageUris, setImageUris] = useState<string[]>(initialImageUris || []);
        const [actionSheetVisible, setActionSheetVisible] = useState(false);
        const [previewUri, setPreviewUri] = useState<string | null>(null);
        const [previewVisible, setPreviewVisible] = useState(false);

        // Loading states
        const [uploadingUris, setUploadingUris] = useState<string[]>([]);
        const [deletingUris, setDeletingUris] = useState<string[]>([]);

        // Track uploaded files
        const sessionUploadedFileIds = useRef<string[]>([]);
        const isSaved = useRef(false);
        const isMounted = useRef(true);
        // Keep a map of localUri -> serverId to handle removals and IDs lookup
        const uploadedFilesMap = useRef<Record<string, string>>({});

        React.useEffect(() => {
            return () => {
                isMounted.current = false;
            };
        }, []);

        React.useImperativeHandle(ref, () => ({
            markAsSaved: () => {
                isSaved.current = true;
            },
            getUploadedIds: () => {
                const ids = imageUris.map(uri => uploadedFilesMap.current[uri]).filter(id => !!id);
                return ids;
            },
        }));

        // Cleanup on unmount
        useEffect(() => {
            return () => {
                if (!isSaved.current && sessionUploadedFileIds.current.length > 0) {
                    sessionUploadedFileIds.current.forEach(id => {
                        documentApi.delete(id).catch(() => {});
                    });
                }
            };
        }, []);

        // Sync with external date prop (for edit mode)
        useEffect(() => {
            if (initialDate) {
                initialDateValue.current = initialDate;
                setSelectedDate(prev => {
                    if (prev.getTime() !== initialDate.getTime()) {
                        setHasDateChanged(false);
                        return initialDate;
                    }
                    return prev;
                });
            }
        }, [initialDate]);

        // Sync with external imageUris prop (for edit mode)
        useEffect(() => {
            if (initialImageUris !== undefined) {
                setImageUris(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(initialImageUris)) {
                        return initialImageUris;
                    }
                    return prev;
                });
            }

            // Pre-fill uploadedFilesMap for existing images when document IDs are provided.
            if (
                initialImageUris &&
                initialDocumentIds &&
                initialImageUris.length === initialDocumentIds.length
            ) {
                const map: Record<string, string> = { ...uploadedFilesMap.current };
                initialImageUris.forEach((uri, index) => {
                    const id = initialDocumentIds[index];
                    if (uri && id) {
                        map[uri] = id;
                    }
                });
                uploadedFilesMap.current = map;
            }
        }, [initialImageUris, initialDocumentIds]);

        // Notify parent when date changes
        useEffect(() => {
            onDateChange?.(selectedDate);
        }, [selectedDate, onDateChange]);

        // Notify parent when images change
        useEffect(() => {
            onImagesChange?.(imageUris);
        }, [imageUris, onImagesChange]);

        // Ref để NetInfo callback đọc uploadingUris mới nhất
        const uploadingUrisRef = useRef<string[]>([]);
        uploadingUrisRef.current = uploadingUris;

        // Khi mạng khôi phục: retry upload cho các ảnh đang loading (chưa có document ID)
        const prevConnectedRef = useRef<boolean | null>(null);
        useEffect(() => {
            const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
                const connected = state.isConnected;
                if (connected === true && prevConnectedRef.current === false) {
                    const pending = uploadingUrisRef.current.filter(
                        uri => !uploadedFilesMap.current[uri]
                    );
                    pending.forEach(uri => {
                        const fileToUpload = {
                            uri,
                            type: 'image/jpeg' as const,
                            name: uri.split('/').pop() || 'image.jpg',
                        };
                        documentApi
                            .upload([fileToUpload])
                            .then(uploadedDocs => {
                                if (
                                    !isMounted.current ||
                                    !uploadedDocs?.length ||
                                    !uploadedDocs[0].id
                                ) {
                                    return;
                                }
                                const docId = uploadedDocs[0].id;
                                sessionUploadedFileIds.current.push(docId);
                                uploadedFilesMap.current[uri] = docId;
                                setUploadingUris(u => u.filter(u2 => u2 !== uri));
                            })
                            .catch(() => {});
                    });
                }
                prevConnectedRef.current = connected;
            });
            return () => unsubscribe();
        }, []);

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

        const uploadFile = async (asset: Asset) => {
            if (!asset.uri) return;

            try {
                // Optimistically update UI
                const uri = asset.uri;
                setImageUris(prev => [...prev, uri]);
                setUploadingUris(prev => [...prev, uri]); // Start loading

                // Formatted file for upload
                const fileToUpload = {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || asset.uri.split('/').pop() || `image-${Date.now()}.jpg`,
                };

                const uploadedDocs = await documentApi.upload([fileToUpload]);

                if (!isMounted.current) {
                    // Cleanup if unmounted during upload
                    if (uploadedDocs && uploadedDocs.length > 0) {
                        uploadedDocs.forEach(doc => {
                            if (doc.id) documentApi.delete(doc.id).catch(() => {});
                        });
                    }
                    return;
                }

                if (uploadedDocs && uploadedDocs.length > 0 && uploadedDocs[0].id) {
                    const docId = uploadedDocs[0].id;
                    sessionUploadedFileIds.current.push(docId);
                    uploadedFilesMap.current[uri] = docId;
                    setUploadingUris(prev => prev.filter(u => u !== uri));
                }
            } catch {
                // Keep image in UI but silent fail
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
                (response: ImagePickerResponse) => {
                    if (response.didCancel) return;
                    if (response.errorMessage) {
                        Alert.alert('Lỗi', response.errorMessage);
                        return;
                    }
                    if (response.assets && response.assets[0]) {
                        uploadFile(response.assets[0]);
                    }
                }
            );
        };

        const handleChooseFromLibrary = () => {
            launchImageLibrary(
                {
                    mediaType: 'photo' as MediaType,
                    quality: 0.8,
                },
                (response: ImagePickerResponse) => {
                    if (response.didCancel) return;
                    if (response.errorMessage) {
                        Alert.alert('Lỗi', response.errorMessage);
                        return;
                    }
                    if (response.assets && response.assets[0]) {
                        uploadFile(response.assets[0]);
                    }
                }
            );
        };

        const handleImagePress = () => {
            setActionSheetVisible(true);
        };

        const handleRemoveImage = async (index: number) => {
            const uriToRemove = imageUris[index];
            const idToRemove = uploadedFilesMap.current[uriToRemove];

            // If currently uploading, prevent removal or handle gracefully (simplest is to block)
            if (uploadingUris.includes(uriToRemove)) return;

            if (idToRemove) {
                setDeletingUris(prev => [...prev, uriToRemove]); // Start deleting loading
                try {
                    await documentApi.delete(idToRemove);
                    // Remove from session tracking
                    sessionUploadedFileIds.current = sessionUploadedFileIds.current.filter(
                        id => id !== idToRemove
                    );
                    delete uploadedFilesMap.current[uriToRemove];

                    // Update UI after successful delete
                    setImageUris(prev => prev.filter((_, i) => i !== index));
                } catch {
                    Alert.alert('Lỗi', 'Không thể xóa ảnh. Vui lòng thử lại.');
                } finally {
                    setDeletingUris(prev => prev.filter(u => u !== uriToRemove)); // Stop deleting loading
                }
            } else {
                // If no ID (local only or error), just remove from UI
                setImageUris(prev => prev.filter((_, i) => i !== index));
            }
        };

        const handlePreviewImage = (uri: string) => {
            setPreviewUri(uri);
            setPreviewVisible(true);
        };

        return (
            <>
                <SelectionInfoBox title="Thông tin chung">
                    {/* Thời gian thực hiện */}
                    <DateInputButton
                        label="Thời gian thực hiện"
                        date={selectedDate}
                        onDateChange={date => {
                            setSelectedDate(date);
                            setHasDateChanged(true);
                        }}
                        formatOptions={{
                            showCurrentLabel: hasDateChanged ? false : 'auto',
                        }}
                        disabled={disabledDate}
                    />

                    {/* Chọn loại hoạt động - dùng cho xử lý nước */}
                    {type === 'water_treatment' && activityOptions && onSelectActivity && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>
                                {activityLabel}
                            </Text>
                            <View style={styles.radioGroup}>
                                {activityOptions.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.radioItem}
                                        onPress={() => onSelectActivity(option)}
                                        activeOpacity={0.8}
                                    >
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                selectedActivity === option &&
                                                    styles.radioOuterSelected,
                                            ]}
                                        >
                                            {selectedActivity === option && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={styles.radioLabel}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Chọn loại hoạt động - dùng cho thu hoạch */}
                    {type === 'harvest' && activityOptions && onSelectActivity && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>
                                {activityLabel}
                            </Text>
                            <View style={styles.harvestRadioGroup}>
                                {activityOptions.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.harvestRadioItem}
                                        onPress={() => onSelectActivity(option)}
                                        activeOpacity={0.8}
                                    >
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                selectedActivity === option &&
                                                    styles.radioOuterSelected,
                                            ]}
                                        >
                                            {selectedActivity === option && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={styles.radioLabel}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Hình ảnh - chỉ dùng cho type withImage */}
                    {type === 'withImage' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hình ảnh</Text>
                            <View style={styles.imagesContainer}>
                                {/* Selected Images */}
                                {imageUris.map((uri, index) => {
                                    const isUploading = uploadingUris.includes(uri);
                                    const isDeleting = deletingUris.includes(uri);
                                    return (
                                        <View key={index} style={styles.imageItem}>
                                            <TouchableOpacity
                                                style={styles.imageInner}
                                                activeOpacity={0.9}
                                                onPress={() =>
                                                    !isUploading &&
                                                    !isDeleting &&
                                                    handlePreviewImage(uri)
                                                }
                                                disabled={isUploading || isDeleting}
                                            >
                                                <Image
                                                    source={{ uri }}
                                                    style={[
                                                        styles.image,
                                                        (isUploading || isDeleting) &&
                                                            styles.imageLoading,
                                                    ]}
                                                />
                                                {isUploading && (
                                                    <View style={styles.loadingOverlay}>
                                                        <ActivityIndicator
                                                            size="small"
                                                            color={colors.white}
                                                        />
                                                    </View>
                                                )}
                                                {isDeleting && (
                                                    <View style={styles.loadingOverlay}>
                                                        <ActivityIndicator
                                                            size="small"
                                                            color={colors.error}
                                                        />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            {!isUploading && !isDeleting && (
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => handleRemoveImage(index)}
                                                    activeOpacity={0.7}
                                                >
                                                    <IconCloseOutlined
                                                        width={10}
                                                        height={10}
                                                        color={colors.textSecondary}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}

                                {/* Add Button */}
                                <TouchableOpacity
                                    style={styles.imageUploadArea}
                                    onPress={handleImagePress}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={16} color={colors.black} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </SelectionInfoBox>

                {/* Image Picker Action Sheet */}
                {type === 'withImage' && (
                    <ImagePickerActionSheet
                        visible={actionSheetVisible}
                        onClose={() => setActionSheetVisible(false)}
                        onTakePhoto={handleTakePhoto}
                        onChooseFromLibrary={handleChooseFromLibrary}
                        onImageSelected={(uri, asset) =>
                            uploadFile({ uri, fileName: asset?.fileName, type: asset?.type })
                        }
                    />
                )}

                {/* Image Preview Modal */}
                {type === 'withImage' && (
                    <ImagePreviewModal
                        visible={previewVisible}
                        imageUri={previewUri}
                        onClose={() => setPreviewVisible(false)}
                    />
                )}
            </>
        );
    }
);

const styles = StyleSheet.create({
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    imageUploadArea: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    imageItem: {
        width: 60,
        height: 60,
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
    imageLoading: {
        opacity: 0.7,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 16,
        height: 16,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    required: {
        color: colors.error,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: spacing.sm, // Khoảng cách cột
        rowGap: spacing.sm, // Khoảng cách hàng
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%', // Chia đôi màn hình
    },
    harvestRadioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 32,
    },
    harvestRadioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        lineHeight: 22,
    },
});
