import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconCalender, IconCloseOutlined } from '@/assets/icons';

type GeneralInfoBoxType = 'default' | 'withImage' | 'water_treatment' | 'harvest';

interface GeneralInfoBox {
  type?: GeneralInfoBoxType;
  dateDisplay: string;
  onPressDate: () => void;
  imageUris?: string[];
  onPressAddImage?: () => void;
  onPressImage?: (uri: string, index: number) => void;
  onRemoveImage?: (index: number) => void;
  activityLabel?: string;
  activityOptions?: string[];
  selectedActivity?: string;
  onSelectActivity?: (val: string) => void;
}

export const GeneralInfoBox: React.FC<GeneralInfoBox> = ({
  type = 'default',
  dateDisplay,
  onPressDate,
  imageUris,
  onPressAddImage,
  onPressImage,
  onRemoveImage,
  activityLabel = 'Chọn loại hoạt động',
  activityOptions,
  selectedActivity,
  onSelectActivity,
}) => {
  return (
    <SelectionInfoBox title="Thông tin chung">
      {/* Thời gian thực hiện */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Thời gian thực hiện</Text>
        <TouchableOpacity style={styles.dateInput} onPress={onPressDate} activeOpacity={0.7}>
          <Text style={styles.dateText}>{dateDisplay}</Text>
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
            {imageUris?.map((uri, index) => (
              <View key={index} style={styles.imageItem}>
                <TouchableOpacity
                  style={styles.imageInner}
                  activeOpacity={0.9}
                  onPress={() => onPressImage?.(uri, index)}
                >
                  <Image source={{ uri }} style={styles.image} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveImage?.(index)}
                  activeOpacity={0.7}
                >
                  <IconCloseOutlined width={10} height={10} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Button */}
            {!!onPressAddImage && (
              <TouchableOpacity
                style={styles.imageUploadArea}
                onPress={onPressAddImage}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SelectionInfoBox>
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
    borderColor: '#DEE4ED',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  required: {
    color: colors.error || '#FF4D4F',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
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
