import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { WaterSupplyInfoBox } from '@/features/farm/components/pondwork/watersupply/WaterSupplyInfoBox';
import { SelectMaterial } from '@/features/farm/components/pondwork/feed/SelectMaterial';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { useFarm } from '@/features/farm/context/FarmContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/images/Icon/IconFarm/Delete.svg';

// Mock data vật tư
const MOCK_MATERIALS: IMaterial[] = [
  { id: '1', name: 'Zeolite', group: 'Khoáng', unit: 'kg', remaining: 50 },
  { id: '2', name: 'Chlorine 70% Granules', group: 'Diệt khuẩn', unit: 'kg', remaining: 20 },
  { id: '3', name: 'Vôi nóng', group: 'Xử lý', unit: 'kg', remaining: 100 },
];

interface SelectedMaterialItem {
  material: IMaterial;
  quantity: number;
  unit: string;
}

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupply'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const { pond, item } = route.params || {};
  const { updatePondJob, getPondJobItems } = useFarm();

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Thông số nước
  const [targetLevel, setTargetLevel] = useState(''); // H_target
  const [supplyLevel, setSupplyLevel] = useState(''); // H_add

  // Vật tư & Ghi chú
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  const [isMaterialModalVisible, setMaterialModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);

  // Modal Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- Load Data khi Edit ---
  useEffect(() => {
    if (item) {
      if (item.date) {
        const parts = item.date.split('/');
        if (parts.length === 3) {
          const d = new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          );
          if (item.time) {
            const [h, m] = item.time.split(':').map(Number);
            d.setHours(h, m);
          }
          setSelectedDate(d);
        }
      }

      setTargetLevel(item.targetLevel?.toString() || '');
      setSupplyLevel(item.supplyLevel?.toString() || '');
      setNote(item.note || '');
      if (item.materials) {
        setSelectedMaterials(item.materials);
      }
    }
  }, [item]);

  // ---LOGIC TÍNH TOÁN THEO CÔNG THỨC---
  const calculateInfo = useMemo(() => {
    // 1. Kiểm tra nếu chưa nhập liệu thì trả về '-'
    if (targetLevel === '' || supplyLevel === '') {
      return {
        drainLevel: '-',
        volumeAfterDrain: '-',
        volumeSupply: '-',
        volumeAfterSupply: '-',
      };
    }

    // 2. Lấy dữ liệu đầu vào
    const H_target = parseFloat(targetLevel);
    const H_add = parseFloat(supplyLevel);

    // Xác định Diện tích ao (S)
    let S = 1000; // Giá trị mặc định
    if (pond?.area) {
      const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
      const parsedArea = parseFloat(areaStr);
      if (!isNaN(parsedArea) && parsedArea > 0) {
        S = parsedArea;
      }
    }

    // 3. Áp dụng công thức
    // H_base = H_target - H_add
    const H_base = H_target - H_add;

    // V_base = S * (H_base / 100)
    const V_base = S * (H_base / 100);

    // V_add = S * (H_add / 100)
    const V_add = S * (H_add / 100);

    // V_total = S * (H_target / 100)
    const V_total = S * (H_target / 100);

    return {
      // Mực nước xả xuống (cm)
      drainLevel: H_base >= 0 ? H_base.toString() : '0',

      // Thể tích sau xả (m3)
      volumeAfterDrain: V_base > 0 ? V_base.toFixed(0) : '0',

      // Thể tích nước cấp vào (m3)
      volumeSupply: V_add.toFixed(0),

      // Thể tích nước sau cấp (m3)
      volumeAfterSupply: V_total.toFixed(0),
    };
  }, [targetLevel, supplyLevel, pond]);

  // const handleDateSelect = (date: Date) => {
  //   const newDate = new Date(selectedDate);
  //   newDate.setFullYear(date.getFullYear());
  //   newDate.setMonth(date.getMonth());
  //   newDate.setDate(date.getDate());
  //   setSelectedDate(newDate);
  // };

  const handleAddMaterial = (data: SelectedMaterialItem) => {
    setSelectedMaterials(prev => [...prev, data]);
  };

  const handleRemoveMaterial = (index: number) => {
    setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!pond?.id) return;

    const currentItems = getPondJobItems(pond.id, 'WATER_CHANGE');
    const timeString = selectedDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateString = selectedDate.toLocaleDateString('en-GB'); // dd/mm/yyyy

    const jobData = {
      targetLevel,
      supplyLevel,
      drainLevel: calculateInfo.drainLevel,
      volumeAfterDrain: calculateInfo.volumeAfterDrain,
      volumeSupply: calculateInfo.volumeSupply,
      volumeAfterSupply: calculateInfo.volumeAfterSupply,
      materials: selectedMaterials,
      note,
    };

    if (item) {
      // UPDATE
      const updatedItems = currentItems.map(i =>
        i.id === item.id ? { ...i, time: timeString, date: dateString, ...jobData } : i
      );
      updatePondJob(pond.id, 'WATER_CHANGE', updatedItems);
    } else {
      // CREATE
      let maxIndex = 0;
      currentItems.forEach(i => {
        const match = i.label.match(/Lần (\d+)/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (idx > maxIndex) maxIndex = idx;
        }
      });
      const nextIndex = maxIndex + 1;

      const newItem = {
        id: Date.now().toString(),
        label: `Lần ${nextIndex}`,
        time: timeString,
        date: dateString,
        ...jobData,
      };
      updatePondJob(pond.id, 'WATER_CHANGE', [...currentItems, newItem]);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (pond?.id && item?.id) {
      const currentItems = getPondJobItems(pond.id, 'WATER_CHANGE');
      const updatedItems = currentItems.filter(i => i.id !== item.id);
      updatePondJob(pond.id, 'WATER_CHANGE', updatedItems);
      navigation.goBack();
    }
    setShowDeleteModal(false);
  };

  const renderHeaderRight = () =>
    item ? (
      <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
        <DeleteIcon width={20} height={20} color={colors.red[900]} />
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.container}>
      <HeaderFarm
        type="simple"
        title={item ? 'Chỉnh sửa Thay/Cấp nước' : 'Thay/Cấp nước'}
        onBack={() => navigation.goBack()}
        rightAction={renderHeaderRight()}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Thông tin chung */}
          <GeneralInfoBox
            type="withImage"
            date={selectedDate}
            onDateChange={setSelectedDate}
            imageUris={imageUris}
            onImagesChange={setImageUris}
          />

          {/* 2. Mực nước & Thể tích */}
          <WaterSupplyInfoBox
            targetLevel={targetLevel}
            onTargetLevelChange={setTargetLevel}
            supplyLevel={supplyLevel}
            onSupplyLevelChange={setSupplyLevel}
            // Truyền các giá trị đã tính toán
            drainLevel={calculateInfo.drainLevel}
            volumeAfterDrain={calculateInfo.volumeAfterDrain}
            volumeSupply={calculateInfo.volumeSupply}
            volumeAfterSupply={calculateInfo.volumeAfterSupply}
          />

          {/* 3. Chọn vật tư */}
          <SelectionInfoBox
            title={
              <Text style={styles.materialTitle}>
                <Text style={styles.required}>* </Text>
                Chọn vật tư
              </Text>
            }
          >
            {selectedMaterials.length > 0 && (
              <View style={styles.materialList}>
                {selectedMaterials.map((mat, index) => (
                  <View key={`${mat.material.id}-${index}`} style={styles.materialItem}>
                    <Text style={styles.materialName}>{mat.material.name}</Text>
                    <View style={styles.materialActions}>
                      <View style={styles.quantityBox}>
                        <Text style={styles.quantityText}>
                          {mat.quantity} {mat.unit}
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

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setMaterialModalVisible(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Thêm vật tư</Text>
            </TouchableOpacity>
          </SelectionInfoBox>

          {/* 4. Ghi chú */}
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

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Huỷ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{item ? 'Cập nhật thông tin' : 'Lưu thông tin'}</Text>
        </TouchableOpacity>
      </View>

      <SelectMaterial
        isVisible={isMaterialModalVisible}
        onClose={() => setMaterialModalVisible(false)}
        onSave={handleAddMaterial}
        materials={MOCK_MATERIALS}
      />
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
  section: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
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
