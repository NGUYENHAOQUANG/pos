import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { useFarm } from '@/features/farm/context/FarmContext';
import { ShrimpInspectionGeneralInfoBox } from '@/features/shrimp-inspection/components/ShrimpInspectionGeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/shrimp-inspection/components/ShrimpInspectionFoodCheckBox';
import { ShrimpInspectionSampleObservationBox } from '@/features/shrimp-inspection/components/ShrimpInspectionObservationBox';
import { ShrimpInspectionNotesBox } from '@/features/shrimp-inspection/components/ShrimpInspectionNotesBox';
import { DeleteTaskModal } from '@/features/shrimp-inspection/components/DeleteTaskModal';
import { ImagePreviewModal } from '@/features/shrimp-inspection/components/ImagePreviewModal';
import { IconTrashOutlined } from '@/assets/icons';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'ShrimpInspection'>;

export const ShrimpInspectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond, itemToEdit } = route.params || {};
  const insets = useSafeAreaInsets();
  const { setTabBarVisible } = useTabBarVisibility();
  const { getPondJobItems, updatePondJob } = useFarm();

  // Initialize state from itemToEdit if available
  const meta = useMemo(() => itemToEdit?.meta || {}, [itemToEdit?.meta]);
  const [selectedDate, setSelectedDate] = useState(meta.date ? new Date(meta.date) : new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [foodAmount, setFoodAmount] = useState(meta.foodAmount || '');
  const [leftoverFood, setLeftoverFood] = useState(meta.leftoverFood || 'Hết');
  const [intestine, setIntestine] = useState(meta.intestine || 'Đầy');
  const [intestineColor, setIntestineColor] = useState(meta.intestineColor || 'Màu thức ăn');
  const [stoolColor, setStoolColor] = useState(meta.stoolColor || 'Màu thức ăn');
  const [liver, setLiver] = useState(meta.liver || 'Bình thường');
  const [notes, setNotes] = useState(meta.notes || '');
  const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Store initial data for comparison when editing
  const initialData = useMemo(() => {
    if (!itemToEdit) return null;
    return {
      date: meta.date ? new Date(meta.date) : new Date(),
      foodAmount: meta.foodAmount || '',
      leftoverFood: meta.leftoverFood || 'Hết',
      intestine: meta.intestine || 'Đầy',
      intestineColor: meta.intestineColor || 'Màu thức ăn',
      stoolColor: meta.stoolColor || 'Màu thức ăn',
      liver: meta.liver || 'Bình thường',
      notes: meta.notes || '',
      images: meta.images || [],
    };
  }, [itemToEdit, meta]);

  // Hide tab bar when this screen is mounted
  useEffect(() => {
    setTabBarVisible(false);
    return () => {
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}, ${hours}:${minutes} (hiện tại)`;
  };

  const handleSave = () => {
    if (pond?.id) {
      const currentItems = getPondJobItems(pond.id, 'SHRIMP_INSPECTION');
      const timeString = selectedDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const itemData = {
        label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
        time: timeString,
        meta: {
          date: selectedDate,
          foodAmount,
          leftoverFood,
          intestine,
          intestineColor,
          stoolColor,
          liver,
          notes,
          images: imageUris,
        },
      };

      if (itemToEdit) {
        // Update existing item
        const updatedItems = currentItems.map(item =>
          item.id === itemToEdit.id ? { ...item, ...itemData } : item
        );
        updatePondJob(pond.id, 'SHRIMP_INSPECTION', updatedItems);
      } else {
        // Create new item
        const nextIndex = currentItems.length + 1;
        const newItem = {
          id: Date.now().toString(),
          ...itemData,
          label: `Lần ${nextIndex}`,
        };
        updatePondJob(pond.id, 'SHRIMP_INSPECTION', [...currentItems, newItem]);
      }
    }

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDeletePress = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (pond?.id && itemToEdit) {
      const currentItems = getPondJobItems(pond.id, 'SHRIMP_INSPECTION');
      const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
      updatePondJob(pond.id, 'SHRIMP_INSPECTION', updatedItems);
      setDeleteModalVisible(false);
      navigation.goBack();
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  // Check if form is filled completely (foodAmount is required only when creating new)
  const isFormComplete = itemToEdit ? true : foodAmount.trim().length > 0;

  // Check if data has changed from initial (when editing)
  const hasChanges = useMemo(() => {
    if (!itemToEdit || !initialData) return true; // New item always has "changes"

    // Compare dates (only date part, not time)
    const currentDateStr = selectedDate.toDateString();
    const initialDateStr = initialData.date.toDateString();
    if (currentDateStr !== initialDateStr) return true;

    // Compare other fields
    if (foodAmount !== initialData.foodAmount) return true;
    if (leftoverFood !== initialData.leftoverFood) return true;
    if (intestine !== initialData.intestine) return true;
    if (intestineColor !== initialData.intestineColor) return true;
    if (stoolColor !== initialData.stoolColor) return true;
    if (liver !== initialData.liver) return true;
    if (notes !== initialData.notes) return true;

    // Compare images array
    if (imageUris.length !== initialData.images.length) return true;
    const imagesChanged = imageUris.some((uri, index) => uri !== initialData.images[index]);
    if (imagesChanged) return true;

    return false;
  }, [
    itemToEdit,
    initialData,
    selectedDate,
    foodAmount,
    leftoverFood,
    intestine,
    intestineColor,
    stoolColor,
    liver,
    notes,
    imageUris,
  ]);

  const isButtonDisabled = !isFormComplete || (itemToEdit && !hasChanges);

  // Only show disabled background style when editing and no changes
  const shouldShowDisabledStyle = itemToEdit && !hasChanges;

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra tôm</Text>
        {itemToEdit ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <IconTrashOutlined width={18} height={18} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent]}>
        {/* Thông tin chung Box */}
        <ShrimpInspectionGeneralInfoBox
          dateDisplay={formatDateTime(selectedDate)}
          onPressDate={() => setIsDatePickerVisible(true)}
          type="withImage"
          imageUris={imageUris}
          onPressAddImage={handleImagePress}
          onPressImage={uri => {
            setPreviewUri(uri);
            setPreviewVisible(true);
          }}
          onRemoveImage={handleRemoveImage}
        />

        {/* Kiểm tra thức ăn Box */}
        <ShrimpInspectionFoodCheckBox
          foodAmount={foodAmount}
          onFoodAmountChange={setFoodAmount}
          leftoverFood={leftoverFood}
          onLeftoverFoodChange={setLeftoverFood}
        />

        {/* Quan sát mẫu Box */}
        <ShrimpInspectionSampleObservationBox
          intestine={intestine}
          onIntestineChange={setIntestine}
          intestineColor={intestineColor}
          onIntestineColorChange={setIntestineColor}
          stoolColor={stoolColor}
          onStoolColorChange={setStoolColor}
          liver={liver}
          onLiverChange={setLiver}
        />

        {/* Ghi chú Box */}
        <ShrimpInspectionNotesBox notes={notes} onNotesChange={setNotes} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <ButtonBarMaterial
          mode="double"
          primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
          secondaryTitle="Huỷ"
          onPrimaryPress={handleSave}
          onSecondaryPress={handleCancel}
          primaryButtonDisabled={itemToEdit ? isButtonDisabled : false}
          primaryButtonStyle={shouldShowDisabledStyle ? styles.disabledButton : undefined}
          primaryButtonTextStyle={shouldShowDisabledStyle ? styles.disabledButtonText : undefined}
        />
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        date={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Image Picker Action Sheet */}
      <ImagePickerActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromLibrary={handleChooseFromLibrary}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={previewVisible}
        imageUri={previewUri}
        onClose={() => setPreviewVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        visible={deleteModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  disabledButton: {
    backgroundColor: '#0000000A',
    borderWidth: 1,
    borderColor: colors.defaultBorder,
  },
  disabledButtonText: {
    color: '#00000040',
    lineHeight: 24,
    fontWeight: '400',
    fontSize: 16,
  },
});
