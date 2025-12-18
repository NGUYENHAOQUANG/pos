import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

import DeleteIcon from '@/assets/images/Icon/IconFarm/Delete.svg';
import { useFarm } from '@/features/farm/context/FarmContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
  MaterialSelectionBox,
  SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';

// Mock data (replace with real data or API later)
const MOCK_MATERIALS: IMaterial[] = [
  { id: '1', name: 'Thức ăn tôm thẻ', group: 'Nuôi', unit: 'kg', remaining: 100 },
  { id: '2', name: 'Khoáng tạt', group: 'Nuôi', unit: 'kg', remaining: 50 },
  { id: '3', name: 'Vôi nóng', group: 'Nuôi', unit: 'kg', remaining: 200 },
  { id: '4', name: 'Khoáng tạc', group: 'Nuôi', unit: 'kg', remaining: 0 },
];

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditFeeder'>;

export const EditFeederScreens = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  // TODO: Add jobId or similar to params to identify what to edit
  const { pondId, jobId } = route.params || {};
  const { updatePondJob, getPondJobItems } = useFarm();

  const [note, setNote] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  const [executionDate, setExecutionDate] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load existing data
  useEffect(() => {
    if (pondId && jobId) {
      const items = getPondJobItems(pondId, 'FEED');
      const itemToEdit = items.find(i => i.id === jobId);
      if (itemToEdit) {
        setNote(itemToEdit.note || '');
        if (itemToEdit.materials) {
          setSelectedMaterials(itemToEdit.materials);
        }
        // Optional: Parse time string back to Date if needed,
        // but currently we just default to 'now' if time parsing is complex or just keep it simple.
        // If we want to show the saved time:
        // itemToEdit.time is "HH:mm". We might want to construct a date object.
        const [hours, minutes] = itemToEdit.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        setExecutionDate(date);
      }
    }
  }, [pondId, jobId, getPondJobItems]);

  const handleSaveInfo = () => {
    if (pondId && jobId) {
      const items = getPondJobItems(pondId, 'FEED');
      const timeString = executionDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const updatedItems = items.map(item => {
        if (item.id === jobId) {
          return {
            ...item,
            time: timeString,
            note: note,
            materials: selectedMaterials,
          };
        }
        return item;
      });

      updatePondJob(pondId, 'FEED', updatedItems);

      Toast.show({
        type: 'success',
        text1: 'Đã cập nhật thông tin thành công',
        position: 'top',
        visibilityTime: 3000,
      });

      navigation.goBack();
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    if (pondId && jobId) {
      const items = getPondJobItems(pondId, 'FEED');
      const updatedItems = items.filter(item => item.id !== jobId);
      updatePondJob(pondId, 'FEED', updatedItems);
      navigation.goBack();
    }
  };

  const renderHeaderRight = () => (
    <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
      <DeleteIcon width={20} height={20} color={colors.red[900]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderFarm
        type="simple"
        title="Cho ăn"
        onBack={() => navigation.goBack()}
        rightAction={renderHeaderRight()}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* General Info Section */}
          <GeneralInfoBox date={executionDate} onDateChange={setExecutionDate} />

          {/* Select Material Section */}
          <MaterialSelectionBox
            selectedMaterials={selectedMaterials}
            onMaterialsChange={setSelectedMaterials}
            materials={MOCK_MATERIALS}
          />

          {/* Note Section */}
          <SelectionNotesBox notes={note} onNotesChange={setNote} />
          <View style={styles.spacer} />
        </ScrollView>
      </View>

      {/* Footer */}
      <ButtonBarFarm
        primaryTitle="Cập nhật thông tin"
        secondaryTitle="Huỷ"
        onPrimaryPress={handleSaveInfo}
        onSecondaryPress={() => navigation.goBack()}
      />

      {/* Modals */}
      <ConfirmationDeleteModal
        visible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  headerDeleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.red[900],
    backgroundColor: colors.white,
  },
  spacer: {
    height: 80,
  },
});
