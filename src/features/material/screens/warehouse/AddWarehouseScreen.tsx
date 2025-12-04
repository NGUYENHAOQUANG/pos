import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { WarehouseInformation } from '../../components/warehouse/WarehouseInformation';
import {
  AddWarehouseMaterial,
  MaterialItem,
} from '../../components/warehouse/AddWarehouseMaterial';
import { ButtonBarMaterial } from '../../components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { ConfirmSubmiss } from '../../components/warehouse/ConfirmSubmiss';

interface AddWarehouseScreenProps {
  onBack?: () => void;
  onSave?: (data: any) => void;
  availableMaterials?: any[];
}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = ({
  onBack,
  onSave,
  availableMaterials = [],
}) => {
  // Combine mock materials with passed available materials
  const materialOptions = availableMaterials.map((m: any) => ({
    label: m.name,
    value: m.name,
    unit: m.unit,
  }));

  const [date, setDate] = useState(new Date());
  const [supplier, setSupplier] = useState('');
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: '1', materialName: '', quantity: '', price: '' },
  ]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const handleAddMaterial = () => {
    setMaterials([
      ...materials,
      { id: Date.now().toString(), materialName: '', quantity: '', price: '' },
    ]);
  };

  const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
    setMaterials(
      materials.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-fill unit when material name is selected
          if (field === 'materialName') {
            // const selectedMaterial = materialOptions.find(m => m.value === value);
            // Note: unit is not currently stored in MaterialItem state in this component,
            // but if we wanted to display it, we could add it to the state.
            // For now, we just ensure the selection works.
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return materials.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + qty * price;
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  const totalAmount = calculateTotal();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        <HeaderMeterial title="Tạo Phiếu Nhập Kho" onBackPress={onBack} rightComponent={null} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <WarehouseInformation
            date={date}
            onDateChange={setDate}
            supplier={supplier}
            onSupplierChange={setSupplier}
          />

          <AddWarehouseMaterial
            materials={materials}
            onUpdateMaterial={handleUpdateMaterial}
            onAddMaterial={handleAddMaterial}
            materialOptions={materialOptions}
          />
        </ScrollView>

        <View style={styles.footer}>
          <ButtonBarMaterial
            mode="total"
            totalLabel="Tổng tiền:"
            totalValue={formatCurrency(totalAmount)}
            primaryTitle="Gửi Phiếu"
            onPrimaryPress={() => {
              setIsConfirmModalVisible(true);
            }}
          />
        </View>

        <ConfirmSubmiss
          visible={isConfirmModalVisible}
          onClose={() => setIsConfirmModalVisible(false)}
          onConfirm={() => {
            setIsConfirmModalVisible(false);
            onSave?.({
              date,
              supplier,
              materials,
              totalAmount,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
});
