import React, { useState } from 'react';
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

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedTheShrimp'>;

export const AddFeederScreens = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const { pondId } = route.params || {}; // Assuming pondId is passed
  const { updatePondJob, getPondJobItems } = useFarm();

  const [note, setNote] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  const [executionDate, setExecutionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    if (pondId) {
      const currentItems = getPondJobItems(pondId, 'FEED');

      // Calculate next index based on max existing label to avoid duplicates
      let maxIndex = 0;
      currentItems.forEach(item => {
        const match = item.label.match(/Lần (\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) maxIndex = index;
        }
      });
      const nextIndex = maxIndex + 1;

      // Use executionDate instead of now
      // Format time as HH:mm to match existing job items style
      const timeString = executionDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      // Format date as DD/MM/YYYY for grouping
      const dateString = executionDate.toLocaleDateString('en-GB'); // dd/mm/yyyy

      const newItem = {
        id: Date.now().toString(),
        label: `Lần ${nextIndex}`,
        time: timeString,
        date: dateString,
        note: note,
        materials: selectedMaterials,
      };

      // Save to context
      updatePondJob(pondId, 'FEED', [...currentItems, newItem]);
    }

    // Logic to save all data
    console.log('Saving feeding info:', {
      time: new Date(),
      materials: selectedMaterials,
      note: note,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderFarm type="simple" title="Cho ăn" onBack={() => navigation.goBack()} />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* General Info Section */}
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
          {/* Add extra padding at bottom to ensure content isn't hidden behind footer if keybaord is open or just for scroll space */}
          <View style={styles.spacer} />
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Huỷ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveInfo}>
          <Text style={styles.saveButtonText}>Lưu thông tin</Text>
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
  spacer: {
    height: 80,
  },
});
