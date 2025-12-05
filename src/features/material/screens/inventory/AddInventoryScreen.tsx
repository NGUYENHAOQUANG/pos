import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { Button } from '@/shared/components/buttons/Button';
import { spacing } from '@/styles';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';

// Import 2 component con
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';

interface AddInventoryScreenProps {
  onBack: () => void;
  onSave: (data: any) => void;
}

export const AddInventoryScreen: React.FC<AddInventoryScreenProps> = ({ onBack, onSave }) => {
  // --- States ---
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [note, setNote] = useState('');

  // State vật tư
  const [materialName, setMaterialName] = useState('');
  const [oldStock, setOldStock] = useState(0);
  const [newStock, setNewStock] = useState('');

  // --- Handlers ---

  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setDatePickerVisible(false);
  };

  const handleMaterialSelect = (val: string) => {
    setMaterialName(val);
    // Giả lập lấy tồn kho cũ từ API khi chọn vật tư
    // Logic thực tế: fetch oldStock based on materialId
    if (val === 'CP 09 – Thức ăn tôm giai đoạn 2') setOldStock(4);
    else if (val === 'Vật tư B') setOldStock(10);
    else setOldStock(0);

    setNewStock(''); // Reset tồn kho mới khi đổi vật tư
  };

  const handleSave = () => {
    const data = {
      date: formatDate(date),
      note,
      items: [
        {
          name: materialName,
          oldStock,
          newStock: Number(newStock),
          diff: Number(newStock) - oldStock,
        },
      ],
    };
    onSave(data);
  };

  // Format Date YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderMeterial title="Tạo Phiếu Điều Chỉnh Tồn Kho" onBackPress={onBack} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Thông tin chung */}
          <InventoryGeneralInfo
            date={formatDate(date)}
            note={note}
            onDatePress={() => setDatePickerVisible(true)}
            onNoteChange={setNote}
          />

          {/* Nhập liệu vật tư */}
          <InventoryMaterialInput
            materialName={materialName}
            oldStock={oldStock}
            newStock={newStock}
            onMaterialSelect={handleMaterialSelect}
            onNewStockChange={setNewStock}
          />
        </ScrollView>
        {/* Nút Gửi Phiếu */}
        <View style={styles.footerContainer}>
          <Button
            title="Gửi Phiếu"
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.button}
            // Disable nút nếu chưa chọn vật tư hoặc chưa nhập số lượng
            disabled={!materialName || !newStock}
          />
        </View>
        {/* Modal Chọn Ngày */}
        <DatePickerModal
          visible={isDatePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          date={date}
          onSelectDate={handleDateConfirm}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  footerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
  },
  button: {
    width: '100%',
    borderRadius: 6,
    minHeight: 40,
    paddingVertical: 0,
  },
});
