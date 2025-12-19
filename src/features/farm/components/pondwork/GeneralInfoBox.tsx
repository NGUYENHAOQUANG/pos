import React, { useState, useEffect } from 'react';
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
import { IconCalender, IconCloseOutlined } from '@/assets/icons';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { ImagePreviewModal } from '@/features/farm/components/pondwork/shrimp-inspection/ImagePreviewModal';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';

type GeneralInfoBoxType = 'default' | 'withImage' | 'water_treatment' | 'harvest';

interface GeneralInfoBox {
  type?: GeneralInfoBoxType;
  date?: Date; // Initial date (for edit mode)
  onDateChange?: (date: Date) => void; // Callback when date changes
  imageUris?: string[]; // Initial images (for edit mode)
  onImagesChange?: (images: string[]) => void; // Callback when images change
  activityLabel?: string;
  activityOptions?: string[];
  selectedActivity?: string;
  onSelectActivity?: (val: string) => void;
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
}) => {
  // Internal state for date
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Internal state for images
  const [imageUris, setImageUris] = useState<string[]>(initialImageUris || []);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Sync with external date prop (for edit mode)
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
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

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes} (hiện tại)`;
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Quyền truy cập camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh',
          buttonNeutral: 'Để sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'OK',
        });
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thời gian thực hiện</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setIsDatePickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{formatDateTime(selectedDate)}</Text>
            <IconCalender width={15} height={15} />
          </TouchableOpacity>
        </View>

        {/* Chọn loại hoạt động - dùng cho xử lý nước, thu hoạch, ... */}
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
                      selectedActivity === option && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedActivity === option && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Hình ảnh - chỉ dùng cho type có hình */}
        {(type === 'withImage' || type === 'harvest') && (
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
                    <IconCloseOutlined width={10} height={10} color={colors.textSecondary} />
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
      {(type === 'withImage' || type === 'harvest') && (
        <ImagePickerActionSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
        />
      )}

      {/* Image Preview Modal */}
      {(type === 'withImage' || type === 'harvest') && (
        <ImagePreviewModal
          visible={previewVisible}
          imageUri={previewUri}
          onClose={() => setPreviewVisible(false)}
        />
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        date={selectedDate}
        onSelectDate={setSelectedDate}
      />
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
  },
});
