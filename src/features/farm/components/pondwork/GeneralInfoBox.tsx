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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
    MediaType,
} from 'react-native-image-picker';

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
    activityLabel?: string; // Label for activity selection (e.g., "Chọn loại thu hoạch")
    activityOptions?: string[]; // Options for activity selection (radio buttons)
    selectedActivity?: string; // Currently selected activity option
    onSelectActivity?: (val: string) => void; // Callback when activity is selected
    disabledDate?: boolean;
}

export const GeneralInfoBox: React.FC<GeneralInfoBox> = ({
    type = 'default',
    date: initialDate,
    onDateChange,
    imageUris: initialImageUris,
    onImagesChange,
    activityLabel = 'Chọn loại hoạt động',
    activityOptions,
    selectedActivity,
    onSelectActivity,
    disabledDate = false,
}) => {
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

    // Sync with external date prop (for edit mode)
    useEffect(() => {
        if (initialDate) {
            initialDateValue.current = initialDate;
            setSelectedDate(initialDate);
            setHasDateChanged(false);
        }
    }, [initialDate]);

    // Sync with external imageUris prop (for edit mode)
    useEffect(() => {
        if (initialImageUris !== undefined) {
            setImageUris(initialImageUris);
        }
    }, [initialImageUris]);

    // Notify parent when date changes
    useEffect(() => {
        onDateChange?.(selectedDate);
    }, [selectedDate, onDateChange]);

    // Notify parent when images change
    useEffect(() => {
        onImagesChange?.(imageUris);
    }, [imageUris, onImagesChange]);

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
                if (response.didCancel) {
                    return;
                }
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets[0]?.uri) {
                    const uri = response.assets[0].uri;
                    if (uri) {
                        setImageUris(prev => [...prev, uri]);
                    }
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
                if (response.didCancel) {
                    return;
                }
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets[0]?.uri) {
                    const uri = response.assets[0].uri;
                    if (uri) {
                        setImageUris(prev => [...prev, uri]);
                    }
                }
            }
        );
    };

    const handleImagePress = () => {
        setActionSheetVisible(true);
    };

    const handleRemoveImage = (index: number) => {
        setImageUris(prev => prev.filter((_, i) => i !== index));
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
                            {imageUris.map((uri, index) => (
                                <View key={index} style={styles.imageItem}>
                                    <TouchableOpacity
                                        style={styles.imageInner}
                                        activeOpacity={0.9}
                                        onPress={() => handlePreviewImage(uri)}
                                    >
                                        <Image source={{ uri }} style={styles.image} />
                                    </TouchableOpacity>
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
                                </View>
                            ))}

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
};

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
