import React from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { DropdownMaterial } from '../material/DropdownMaterial';
import { colors, spacing, borderRadius } from '@/styles';

interface InventoryMaterialInputProps {
  materialName: string;
  oldStock: number;
  newStock: string;
  onMaterialSelect: (val: string) => void;
  onNewStockChange: (val: string) => void;
}

export const InventoryMaterialInput: React.FC<InventoryMaterialInputProps> = ({
  materialName,
  oldStock,
  newStock,
  onMaterialSelect,
  onNewStockChange,
}) => {
  // Tính chênh lệch
  const diff = newStock ? Number(newStock) - oldStock : 0;

  // Kiểm tra đã chọn vật tư chưa
  const hasSelectedMaterial = !!materialName;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vật tư điều chỉnh</Text>

      {/* Dropdown chọn vật tư (Sử dụng component có sẵn) */}
      <View style={hasSelectedMaterial ? styles.dropdownWithMargin : styles.dropdownNoMargin}>
        <DropdownMaterial
          value={materialName}
          placeholder="Chọn vật tư"
          options={['CP 09 – Thức ăn tôm giai đoạn 2', 'Vật tư B', 'Vật tư C']}
          onChange={onMaterialSelect}
          showAllOption={false}
        />
      </View>

      {/* Chỉ hiện phần nhập liệu khi ĐÃ chọn vật tư */}
      {hasSelectedMaterial && (
        <View style={styles.inputContainer}>
          <View style={styles.row}>
            {/* Cột Trái: Tồn kho cũ */}
            <View style={styles.col}>
              <Text style={styles.label}>Tồn kho cũ:</Text>
              <Text style={styles.oldStockValue}>{oldStock} Kg</Text>
            </View>

            {/* Cột Phải: Tồn kho mới */}
            <View style={styles.col}>
              <Text style={styles.label}>
                <Text style={styles.required}>* </Text>Tồn kho mới
              </Text>
              <View style={styles.stockInputWrapper}>
                <TextInput
                  style={styles.stockInput}
                  keyboardType="numeric"
                  value={newStock}
                  onChangeText={onNewStockChange}
                />
                <Text style={styles.unit}>Kg</Text>
              </View>
            </View>
          </View>

          {/* Dòng Tổng chênh lệch */}
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Tổng chênh lệch:</Text>
            <Text
              style={[
                styles.footerValue,
                diff < 0 ? styles.footerValueNegative : styles.footerValuePositive,
              ]}
            >
              {diff}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  inputContainer: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '400',
  },
  required: {
    color: colors.error || '#FF4D4F',
  },
  oldStockValue: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    marginTop: 4,
  },
  stockInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.sm,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  stockInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
    height: '100%',
  },
  unit: {
    color: '#999',
    fontSize: 14,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 14,
    color: colors.text,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownWithMargin: {
    marginBottom: 16,
  },
  dropdownNoMargin: {
    marginBottom: 0,
  },
  footerValueNegative: {
    color: '#FF4D4F',
  },
  footerValuePositive: {
    color: '#52C41A',
  },
});
