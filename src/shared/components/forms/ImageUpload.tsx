/**
 * @file ImageUpload.tsx
 * @description Image upload component with action sheet
 * @author Auto
 * @created 2025-01-27
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, borderRadius, typography, sizes} from '@/styles';
import {ImagePickerActionSheet} from './ImagePickerActionSheet';

interface ImageUploadProps {
  imageUri?: string | null;
  onImageSelect?: (uri: string) => void;
  onImageRemove?: () => void;
  style?: ViewStyle;
  label?: string;
}

export function ImageUpload({
  imageUri,
  onImageSelect,
  onImageRemove,
  style,
  label,
}: ImageUploadProps) {
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

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
          },
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
          onImageSelect?.(response.assets[0].uri);
        }
      },
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
          onImageSelect?.(response.assets[0].uri);
        }
      },
    );
  };

  const handleImagePress = () => {
    if (imageUri) {
      // If image exists, show action sheet to change or remove
      setActionSheetVisible(true);
    } else {
      // If no image, show action sheet to select
      setActionSheetVisible(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.uploadContainer}
        onPress={handleImagePress}
        activeOpacity={0.7}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{uri: imageUri}} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={e => {
                e.stopPropagation();
                onImageRemove?.();
              }}
              activeOpacity={0.7}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="image-outline"
              size={sizes.icon['2xl']}
              color={colors.textSecondary}
            />
            <Ionicons
              name="add-circle"
              size={sizes.icon.lg}
              color={colors.textSecondary}
              style={styles.addIcon}
            />
          </View>
        )}
      </TouchableOpacity>

      <ImagePickerActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromLibrary={handleChooseFromLibrary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
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
});

