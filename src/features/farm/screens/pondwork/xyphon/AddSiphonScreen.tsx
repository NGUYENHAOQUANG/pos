import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SiphonLossBox } from '@/features/farm/components/pondwork/xyphon/SiphonLossBox';
import {
  MaterialSelectionBox,
  SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { IMaterial } from '@/features/material/types/material.types';
import { useFarm } from '@/features/farm/context/FarmContext';
import { SiphonMeta } from '@/features/farm/types/farm.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddSiphonScreen'>;

export const AddSiphonScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond, itemToEdit } = route.params || {};
  const insets = useSafeAreaInsets();
  const { setTabBarVisible } = useTabBarVisibility();
  const { getPondJobItems, updatePondJob } = useFarm();

  // Initialize state from itemToEdit if available
  const meta = useMemo(() => (itemToEdit?.meta as SiphonMeta) || {}, [itemToEdit?.meta]);
  const [selectedDate, setSelectedDate] = useState<Date>(
    meta.date ? new Date(meta.date) : new Date()
  );
  const [lossAmount, setLossAmount] = useState<string>(meta.lossAmount || '');
  const [notes, setNotes] = useState<string>(itemToEdit?.note || '');
  const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>(
    itemToEdit?.materials || []
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Store initial data for comparison when editing
  const initialData = useMemo(() => {
    if (!itemToEdit) return null;
    return {
      date: meta.date ? new Date(meta.date) : new Date(),
      lossAmount: meta.lossAmount || '',
      notes: itemToEdit.note || '',
      images: meta.images || [],
      materials: itemToEdit.materials || [],
    };
  }, [itemToEdit, meta]);

  // Mock materials (replace with real data or API later)
  const MOCK_MATERIALS: IMaterial[] = [
    { id: '1', name: 'Thức ăn tôm thẻ', group: 'Nuôi', unit: 'kg', remaining: 100 },
    { id: '2', name: 'Khoáng tạt', group: 'Nuôi', unit: 'kg', remaining: 50 },
    { id: '3', name: 'Vôi nóng', group: 'Nuôi', unit: 'kg', remaining: 200 },
    { id: '4', name: 'Khoáng tạc', group: 'Nuôi', unit: 'kg', remaining: 0 },
  ];

  // Hide tab bar when this screen is mounted
  useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDeletePress = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (pond?.id && itemToEdit) {
      const currentItems = getPondJobItems(pond.id, 'SIPHON');
      const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
      updatePondJob(pond.id, 'SIPHON', updatedItems);
      setDeleteModalVisible(false);
      navigation.goBack();
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  // Check if data has changed from initial (when editing)
  const hasChanges = useMemo(() => {
    if (!itemToEdit || !initialData) return true; // New item always has "changes"

    // Compare dates (only date part, not time)
    const currentDateStr = selectedDate.toDateString();
    const initialDateStr = initialData.date.toDateString();
    if (currentDateStr !== initialDateStr) return true;

    // Compare other fields
    if (lossAmount !== initialData.lossAmount) return true;
    if (notes !== initialData.notes) return true;

    // Compare images arrays
    if (JSON.stringify(imageUris) !== JSON.stringify(initialData.images)) return true;

    // Compare materials arrays
    if (JSON.stringify(selectedMaterials) !== JSON.stringify(initialData.materials)) return true;

    return false;
  }, [itemToEdit, initialData, selectedDate, lossAmount, notes, imageUris, selectedMaterials]);

  const isButtonDisabled = itemToEdit && !hasChanges;
  const shouldShowDisabledStyle = itemToEdit && !hasChanges;

  const handleSave = () => {
    if (!pond?.id) {
      navigation.goBack();
      return;
    }

    const pondId = pond.id;
    const currentItems = getPondJobItems(pondId, 'SIPHON');

    // Time & date formatting (reuse pattern from feeding)
    const timeString = selectedDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateString = selectedDate.toLocaleDateString('en-GB'); // dd/mm/yyyy

    const baseData = {
      label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
      time: timeString,
      date: dateString,
      note: notes || undefined,
      materials: selectedMaterials,
      meta: {
        ...(itemToEdit?.meta || {}),
        date: selectedDate,
        lossAmount,
        images: imageUris,
      } as SiphonMeta,
    };

    if (itemToEdit) {
      // Update existing SIPHON job
      const updatedItems = currentItems.map(item =>
        item.id === itemToEdit.id ? { ...item, ...baseData } : item
      );
      updatePondJob(pondId, 'SIPHON', updatedItems);
    } else {
      // Create new SIPHON job with proper next index
      let maxIndex = 0;
      currentItems.forEach(item => {
        const match = item.label.match(/Lần (\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) maxIndex = index;
        }
      });
      const nextIndex = maxIndex + 1;

      const newItem = {
        id: Date.now().toString(),
        ...baseData,
        label: `Lần ${nextIndex}`,
      };

      updatePondJob(pondId, 'SIPHON', [...currentItems, newItem]);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xi-Phông</Text>
        {itemToEdit ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <IconTrashOutlined width={18} height={18} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <GeneralInfoBox
          type="withImage"
          date={selectedDate}
          onDateChange={setSelectedDate}
          imageUris={imageUris}
          onImagesChange={setImageUris}
        />

        <SiphonLossBox lossAmount={lossAmount} onLossAmountChange={setLossAmount} />

        <MaterialSelectionBox
          selectedMaterials={selectedMaterials}
          onMaterialsChange={setSelectedMaterials}
          materials={MOCK_MATERIALS}
        />

        <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <ButtonBarMaterial
          mode="double"
          primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
          secondaryTitle="Huỷ"
          onPrimaryPress={handleSave}
          onSecondaryPress={handleCancel}
          primaryButtonDisabled={isButtonDisabled}
          primaryButtonStyle={shouldShowDisabledStyle ? styles.disabledButton : undefined}
          primaryButtonTextStyle={shouldShowDisabledStyle ? styles.disabledButtonText : undefined}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmationDeleteModal
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
    paddingTop: 12 - 4,
    paddingBottom: spacing.xs,
  },
  disabledButton: {
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.defaultBorder,
  },
  disabledButtonText: {
    color: colors.borderSubtle,
    lineHeight: 24,
    fontWeight: '400',
    fontSize: 16,
  },
});
