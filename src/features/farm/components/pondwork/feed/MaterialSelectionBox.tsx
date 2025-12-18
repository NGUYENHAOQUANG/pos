import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectMaterial } from '@/features/farm/components/pondwork/feed/SelectMaterial';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/images/Icon/IconFarm/Delete.svg';

export interface SelectedMaterialItem {
  material: IMaterial;
  quantity: number;
  unit: string;
}

interface MaterialSelectionBoxProps {
  selectedMaterials: SelectedMaterialItem[];
  onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
  materials: IMaterial[]; // Available materials list for SelectMaterial modal
}

/**
 * Reusable component for material selection with list display and add/remove functionality
 */
export const MaterialSelectionBox: React.FC<MaterialSelectionBoxProps> = ({
  selectedMaterials,
  onMaterialsChange,
  materials,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddMaterial = (data: SelectedMaterialItem) => {
    onMaterialsChange([...selectedMaterials, data]);
    setModalVisible(false);
  };

  const handleRemoveMaterial = (index: number) => {
    onMaterialsChange(selectedMaterials.filter((_, i) => i !== index));
  };

  return (
    <>
      <SelectionInfoBox
        title={
          <Text style={styles.title}>
            <Text style={styles.required}>* </Text>
            Chọn vật tư
          </Text>
        }
      >
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

        <View style={styles.divider} />

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>Thêm vật tư</Text>
        </TouchableOpacity>
      </SelectionInfoBox>

      {/* Select Material Modal */}
      <SelectMaterial
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMaterial}
        materials={materials}
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  materialList: {
    gap: spacing.sm,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderColor: colors.border,
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
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    height: 32,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -spacing.md,
  },
});
