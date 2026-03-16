import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    PermissionsAndroid,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    MediaType,
    Asset,
} from 'react-native-image-picker';
import { documentApi } from '@/features/material/api/documentApi';
import { APP_CONFIG } from '@/shared/constants/config';
import { showImageSizeExceededToast } from '@/features/farm/utils/toastMessages';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconCloseOutlined } from '@/assets/icons';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { ImagePreviewModal } from '@/features/farm/components/pondwork/shrimp-inspection/ImagePreviewModal';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { RequiredDot } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { Button } from '@/shared/components/buttons/Button';

export interface GeneralInfoBoxRef {
    markAsSaved: () => void;
    getUploadedIds: () => string[];
}
type GeneralInfoBoxType = 'default' | 'withImage' | 'water_treatment' | 'harvest';
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

        // Dynamic image grid sizing
        const [gridWidth, setGridWidth] = useState(0);

        // Track total size of images (bytes) to enforce global limit
        const [totalImageSize, setTotalImageSize] = useState(0);
        const imageSizesRef = useRef<Record<string, number>>({});
        const MAX_TOTAL_IMAGE_SIZE_BYTES = APP_CONFIG.IMAGE_SIZE_LIMIT_BYTES;

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

        // Keep callback refs stable to avoid infinite loops
        const onDateChangeRef = useRef(onDateChange);
        onDateChangeRef.current = onDateChange;

        const onImagesChangeRef = useRef(onImagesChange);
        onImagesChangeRef.current = onImagesChange;

        // Notify parent when date changes
        useEffect(() => {
            onDateChangeRef.current?.(selectedDate);
        }, [selectedDate]);

        // Notify parent when images change
        useEffect(() => {
            onImagesChangeRef.current?.(imageUris);
        }, [imageUris]);

        // Track URIs that need retry upload (failed due to network or other transient errors)
        const pendingRetryUris = useRef<Set<string>>(new Set());
        const retryInProgressRef = useRef(false);

        // Retry upload helper - processes all pending URIs
        const retryPendingUploads = React.useCallback(() => {
            if (retryInProgressRef.current) return;
            const pending = Array.from(pendingRetryUris.current).filter(
                uri => !uploadedFilesMap.current[uri]
            );
            if (pending.length === 0) return;

            retryInProgressRef.current = true;
            const retryPromises = pending.map(uri => {
                const fileToUpload = {
                    uri,
                    type: 'image/jpeg' as const,
                    name: uri.split('/').pop() || 'image.jpg',
                };
                return documentApi
                    .upload([fileToUpload])
                    .then(uploadedDocs => {
                        if (!isMounted.current || !uploadedDocs?.length || !uploadedDocs[0].id) {
                            return;
                        }
                        const docId = uploadedDocs[0].id;
                        sessionUploadedFileIds.current.push(docId);
                        uploadedFilesMap.current[uri] = docId;
                        pendingRetryUris.current.delete(uri);
                        setUploadingUris(u => u.filter(u2 => u2 !== uri));
                    })
                    .catch(() => {
                        // Still pending, will retry next cycle
                    });
            });
            Promise.all(retryPromises)
                .then(() => {
                    retryInProgressRef.current = false;
                })
                .catch(() => {
                    retryInProgressRef.current = false;
                });
        }, []);

        // Khi mạng khôi phục: retry upload cho các ảnh pending
        const prevConnectedRef = useRef<boolean | null>(null);
        useEffect(() => {
            const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
                const connected = state.isConnected;
                // Retry khi mạng chuyển từ off → on (bao gồm cả lần đầu null → true)
                if (connected === true && prevConnectedRef.current !== true) {
                    retryPendingUploads();
                }
                prevConnectedRef.current = connected ?? null;
            });
            return () => unsubscribe();
        }, [retryPendingUploads]);

        // Periodic retry mỗi 10s cho trường hợp mạng "connected" nhưng request vẫn fail
        useEffect(() => {
            const interval = setInterval(() => {
                if (pendingRetryUris.current.size > 0) {
                    retryPendingUploads();
                }
            }, 10000);
            return () => clearInterval(interval);
        }, [retryPendingUploads]);

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

            const sizeBytes = asset.fileSize ?? 0;
            if (sizeBytes > 0 && totalImageSize + sizeBytes > MAX_TOTAL_IMAGE_SIZE_BYTES) {
                showImageSizeExceededToast();
                return;
            }

            try {
                // Optimistically update UI
                const uri = asset.uri;
                setImageUris(prev => [...prev, uri]);
                setUploadingUris(prev => [...prev, uri]); // Start loading
                if (sizeBytes > 0) {
                    imageSizesRef.current[uri] = sizeBytes;
                    setTotalImageSize(prev => prev + sizeBytes);
                }

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
                }
                // Always remove spinner when upload call completes (success or unexpected response)
                setUploadingUris(prev => prev.filter(u => u !== uri));
            } catch {
                // Retry upload up to 2 times before giving up
                const uri = asset.uri;
                const fileToRetry = {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || asset.uri.split('/').pop() || `image-${Date.now()}.jpg`,
                };

                for (let attempt = 1; attempt <= 2; attempt++) {
                    try {
                        await new Promise<void>(r => setTimeout(r, attempt * 1500));
                        if (!isMounted.current) return;

                        const retryDocs = await documentApi.upload([fileToRetry]);
                        if (!isMounted.current) return;

                        if (retryDocs?.length > 0 && retryDocs[0].id) {
                            const docId = retryDocs[0].id;
                            sessionUploadedFileIds.current.push(docId);
                            uploadedFilesMap.current[uri] = docId;
                            setUploadingUris(prev => prev.filter(u => u !== uri));
                            return; // Retry succeeded
                        }
                    } catch {
                        // Continue to next retry attempt
                    }
                }

                // All retries failed — remove spinner but keep image visible
                if (isMounted.current) {
                    setUploadingUris(prev => prev.filter(u => u !== uri));
                }
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
                    includeExtra: true,
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
                        response.assets.forEach(asset => {
                            uploadFile(asset);
                        });
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

            const removeLocalOnly = () => {
                setImageUris(prev => prev.filter((_, i) => i !== index));
                const removedSize = imageSizesRef.current[uriToRemove] ?? 0;
                if (removedSize > 0) {
                    setTotalImageSize(prev => Math.max(0, prev - removedSize));
                    delete imageSizesRef.current[uriToRemove];
                }
            };

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
                    removeLocalOnly();
                } catch {
                    Alert.alert('Lỗi', 'Không thể xóa ảnh. Vui lòng thử lại.');
                } finally {
                    setDeletingUris(prev => prev.filter(u => u !== uriToRemove)); // Stop deleting loading
                }
            } else {
                // If no ID (local only or error), just remove from UI
                removeLocalOnly();
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
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>{activityLabel}</Text>
                                <RequiredDot />
                            </View>
                            <RadioButton
                                options={activityOptions.map(opt => ({ label: opt, value: opt }))}
                                value={selectedActivity}
                                onValueChange={onSelectActivity}
                                containerStyle={styles.radioGroup}
                                itemStyle={styles.radioItem}
                                gap={0}
                            />
                        </View>
                    )}

                    {/* Chọn loại hoạt động - dùng cho thu hoạch */}
                    {type === 'harvest' && activityOptions && onSelectActivity && (
                        <View style={styles.inputGroup}>
                            <View style={styles.labelWrapper}>
                                <Text style={styles.label}>{activityLabel}</Text>
                                <RequiredDot />
                            </View>
                            <RadioButton
                                options={activityOptions.map(opt => ({ label: opt, value: opt }))}
                                value={selectedActivity}
                                onValueChange={onSelectActivity}
                                containerStyle={styles.radioGroup}
                                itemStyle={styles.harvestRadioItem}
                                gap={32}
                            />
                        </View>
                    )}

                    {/* Hình ảnh - chỉ dùng cho type withImage */}
                    {type === 'withImage' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hình ảnh</Text>

                            <Button
                                title="Thêm hình ảnh"
                                variant="outline"
                                onPress={handleImagePress}
                                iconLeft="add"
                                fullWidth
                            />

                            {imageUris.length > 0 && (
                                <View
                                    style={styles.imagesGrid}
                                    onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
                                >
                                    {imageUris.map((uri, index) => {
                                        const isUploading = uploadingUris.includes(uri);
                                        const isDeleting = deletingUris.includes(uri);
                                        const imageSize =
                                            gridWidth > 0
                                                ? Math.floor((gridWidth - IMAGE_GAP * 3) / 4)
                                                : 70;
                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.imageItem,
                                                    { width: imageSize, height: imageSize },
                                                ]}
                                            >
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
                                                            width={12}
                                                            height={12}
                                                            color={colors.textSecondary}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
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
                            uploadFile({
                                uri,
                                fileName: asset?.fileName,
                                type: asset?.type,
                                fileSize: (asset as Asset | undefined)?.fileSize,
                            } as Asset)
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

const IMAGE_GAP = 8;

const styles = StyleSheet.create({
    inputGroup: {
        gap: spacing.sm,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 22,
    },
    addImageButtonFull: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        gap: 8,
    },
    addImageText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '400',
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
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: '#F3F4F6',
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
        columnGap: spacing.sm,
        rowGap: spacing.sm,
    },
    radioItem: {
        width: '48%',
        paddingVertical: 6,
    },
    harvestRadioItem: {
        paddingVertical: 6,
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
        borderColor: colors.primaryOrange,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryOrange,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        lineHeight: 22,
    },
});
