import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectMaterial } from '@/features/farm/components/pondwork/feed/SelectMaterial';
import { IMaterial } from '@/features/material/types/material.types';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ComfirmDelete } from '@/features/farm/components/pondwork/feed/ComfirmDelete';

import DeleteIcon from '@/assets/images/Icon/IconFarm/Delete.svg';
import { useFarm } from '@/features/farm/context/FarmContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';

// Mock data (replace with real data or API later)
const MOCK_MATERIALS: IMaterial[] = [
  { id: '1', name: 'Thức ăn tôm thẻ', group: 'Nuôi', unit: 'kg', remaining: 100 },
  { id: '2', name: 'Khoáng tạt', group: 'Nuôi', unit: 'kg', remaining: 50 },
  { id: '3', name: 'Vôi nóng', group: 'Nuôi', unit: 'kg', remaining: 200 },
  { id: '4', name: 'Khoáng tạc', group: 'Nuôi', unit: 'kg', remaining: 0 },
];

interface SelectedMaterialItem {
  material: IMaterial;
  quantity: number;
  unit: string;
}

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditFeeder'>;

export const EditFeederScreens = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  // TODO: Add jobId or similar to params to identify what to edit
  const { pondId, jobId } = route.params || {};
  const { updatePondJob, getPondJobItems } = useFarm();

  const [note, setNote] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  const [executionDate, setExecutionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Format time as dd-mm-yyyy, hr:mm
  const formatExectionTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Check if it's today to append "(hiện tại)" optionally, or just always show generic
    const isToday = new Date().toDateString() === date.toDateString();
    return `${day}-${month}-${year}, ${hours}:${minutes}${isToday ? ' (hiện tại)' : ''}`;
  };

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

  const handleDateSelect = (date: Date) => {
    // Preserve current time, only change date
    const newDate = new Date(executionDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setExecutionDate(newDate);
  };

  const handleAddMaterial = (data: SelectedMaterialItem) => {
    // Add new item to the list
    setSelectedMaterials(prev => [...prev, data]);
  };

  const handleRemoveMaterial = (index: number) => {
    setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
  };

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
      {/* ... existing header and content */}
      <HeaderFarm
        type="simple"
        title="Cho ăn"
        onBack={() => navigation.goBack()}
        rightAction={renderHeaderRight()}
      />

      <View style={styles.contentContainer}>
        {/* ... existing scrollview */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ... sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Thời gian thực hiện</Text>
            <TouchableOpacity
              style={styles.timeInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.timeText}>{formatExectionTime(executionDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* Select Material Section */}
          <View style={styles.section}>
            <Text style={styles.label}>
              <Text style={styles.required}>* </Text>
              Chọn vật tư
            </Text>
            <View style={styles.divider} />

            {/* List of selected materials */}
            {selectedMaterials.length > 0 && (
              <View style={styles.materialList}>
                {selectedMaterials.map((item, index) => (
                  <View key={`${item.material.id}-${index}`} style={styles.materialItem}>
                    <Text style={styles.materialName}>{item.material.name}</Text>
                    <View style={styles.materialActions}>
                      <View style={styles.quantityBox}>
                        <Text style={styles.quantityText}>
                          {item.quantity}
                          {item.unit}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveMaterial(index)}
                        style={styles.deleteButton}
                      >
                        <DeleteIcon width={18} height={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Thêm vật tư</Text>
            </TouchableOpacity>
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú"
              placeholderTextColor={colors.gray[300]}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </View>
          <View style={styles.spacer} />
        </ScrollView>
      </View>

      {/* ... existing footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Huỷ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveInfo}>
          <Text style={styles.saveButtonText}>Cập nhật thông tin</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        date={executionDate}
        onSelectDate={handleDateSelect}
      />
      <SelectMaterial
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMaterial}
        materials={MOCK_MATERIALS}
      />

      <ComfirmDelete
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
  section: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  required: {
    color: colors.error,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 44,
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.blue[400],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    borderStyle: 'solid',
    backgroundColor: colors.white,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginRight: spacing.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  materialList: {
    marginBottom: spacing.md,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  materialName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  materialActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBox: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    height: 40,
    width: 110,
    marginRight: spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    color: colors.text,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.sm,
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
