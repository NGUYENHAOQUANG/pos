import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { DropDownSelectMaterial } from '@/features/farm/components/pondwork/feed/DropDownSelectMaterial';
import { DropDownButtonBasic, DropDownItem } from '../../DropDownButtonBasic';

interface SelectMaterialProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: { material: IMaterial; quantity: number; unit: string }) => void;
  materials: IMaterial[];
  units?: DropDownItem[];
}

const DEFAULT_UNITS: DropDownItem[] = [
  { id: 'kg', label: 'kg' },
  { id: 'g', label: 'g' },
  { id: 'l', label: 'L' },
  { id: 'ml', label: 'ml' },
  { id: 'bao', label: 'Bao' },
  { id: 'chai', label: 'Chai' },
];

export const SelectMaterial: React.FC<SelectMaterialProps> = ({
  isVisible,
  onClose,
  onSave,
  materials,
  units = DEFAULT_UNITS,
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | undefined>();
  const [quantity, setQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<DropDownItem | undefined>();

  // Auto-fill unit based on selected material
  useEffect(() => {
    if (selectedMaterial && selectedMaterial.unit) {
      const unitToSelect = units.find(
        u => u.label.toLowerCase() === selectedMaterial.unit?.toLowerCase()
      );
      if (unitToSelect) {
        setSelectedUnit(unitToSelect);
      }
    }
  }, [selectedMaterial, units]);

  const handleSave = () => {
    if (selectedMaterial && quantity && selectedUnit) {
      onSave({
        material: selectedMaterial,
        quantity: parseFloat(quantity),
        unit: selectedUnit.label,
      });
      // Reset form
      setSelectedMaterial(undefined);
      setQuantity('');
      setSelectedUnit(undefined);
      onClose();
    }
  };

  const handleCreateNewMaterial = () => {
    // Logic for creating new material - to be implemented or passed as prop
    console.log('Create new material');
  };

  const handleImportMore = (item: IMaterial) => {
    // Logic for importing more material
    console.log('Import more material', item.name);
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Chọn vật tư</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {/* Material Selection */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    <Text style={styles.required}>* </Text>
                    Chọn loại sản phẩm
                  </Text>
                  <DropDownSelectMaterial
                    data={materials}
                    selectedItem={selectedMaterial}
                    onSelect={setSelectedMaterial}
                    onCreateNew={handleCreateNewMaterial}
                    onImportMore={handleImportMore}
                    placeholder="Chọn"
                  />
                </View>

                {/* Quantity and Unit Row */}
                <View style={styles.row}>
                  {/* Quantity Input */}
                  <View style={[styles.fieldGroup, styles.quantityContainer]}>
                    <Text style={styles.label}>
                      <Text style={styles.required}>* </Text>
                      Số lượng
                    </Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Input"
                        placeholderTextColor={colors.gray[300]}
                        value={quantity}
                        onChangeText={text => setQuantity(text.replace(/[^0-9.]/g, ''))}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Unit Dropdown */}
                  <View style={[styles.fieldGroup, styles.unitContainer]}>
                    <Text style={styles.label}>
                      <Text style={styles.required}>* </Text>
                      Đơn vị
                    </Text>
                    <DropDownButtonBasic
                      data={units}
                      value={selectedUnit}
                      onSelect={setSelectedUnit}
                      style={styles.unitDropdownWrapper}
                      showIcon={false}
                    />
                  </View>
                </View>
              </View>

              {/* Footer Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!selectedMaterial || !quantity || !selectedUnit) && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={!selectedMaterial || !quantity || !selectedUnit}
                >
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.md,
    zIndex: 2,
  },
  fieldGroup: {
    marginBottom: spacing.md,
    zIndex: 100, // Dropdown needs higher index
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    zIndex: 1,
  },
  inputContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    fontSize: 14,
    color: colors.text,
    padding: 0,
    height: '100%',
  },
  quantityContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  unitContainer: {
    flex: 1,
  },
  unitDropdownWrapper: {
    height: 44,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 0, // Image doesn't clearly show a strong divider, but we can keep it light or remove. Keeping light.
    borderTopColor: colors.gray[100],
    zIndex: 1,
  },
  cancelButton: {
    height: 40,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginRight: spacing.md,
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  saveButton: {
    height: 40,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.gray[400],
  },
  saveButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
});
