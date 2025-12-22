import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/components/pond/CreateCycleForm';
import { FarmStackParamList } from '../../navigation/FarmNavigator';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import TrashOutlined from '@/assets/images/Icon/IconDevices/TrashOutlined.svg';
import Toast from 'react-native-toast-message';
import { useFarm } from '../../context/FarmContext';
import { CycleFormData } from '../../types/farm.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRouteProp>();

  // Lấy các hàm từ FarmContext
  const { saveActiveCycle, deleteActiveCycle } = useFarm();

  const { pondId, initialData } = route.params;
  const isEdit = !!initialData;

  // State quản lý ẩn/hiện Modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Convert CycleData to CycleFormData if initialData exists
  const convertCycleDataToFormData = (data: any): CycleFormData => {
    if (!data) {
      return {
        cycleName: '',
        breedSource: undefined,
        season: undefined,
        stockingDate: new Date().toISOString(),
        stockingQuantity: null,
        age: null,
      };
    }
    return {
      cycleName: data.cycleName || '',
      breedSource: data.breedSource,
      season: data.season,
      stockingDate: data.stockingDate || new Date().toISOString(),
      stockingQuantity: data.stockingQuantity ?? null,
      age: data.age ?? null,
      density: data.density?.toString(),
      estimatedCost: data.estimatedCost?.toString(),
      notes: data.notes,
    };
  };

  // Sử dụng state cục bộ để quản lý dữ liệu form trước khi lưu
  const [cycleData, setCycleData] = useState<CycleFormData>(
    convertCycleDataToFormData(initialData)
  );

  const checkFields = () => {
    return (
      !!cycleData.breedSource &&
      !!cycleData.season &&
      !!cycleData.cycleName &&
      !!cycleData.stockingDate &&
      Number(cycleData.stockingQuantity) > 0 &&
      Number(cycleData.age) > 0
    );
  };

  const handleCreate = () => {
    if (!checkFields()) {
      return Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập đầy đủ các thông tin',
        position: 'top',
        topOffset: 60,
      });
    }

    // Lưu vào FarmContext
    if (pondId) {
      saveActiveCycle(pondId, cycleData);
    }
    navigation.goBack();
  };

  const onConfirmDelete = () => {
    if (pondId) {
      deleteActiveCycle(pondId); // Xóa trong FarmContext
      setShowDeleteModal(false); // Đóng modal

      // Navigate về màn hình ao nuôi để hiện Toast thành công
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <HeaderFarm
        title={isEdit ? 'Chỉnh sửa chu kỳ nuôi' : 'Tạo chu kỳ nuôi'}
        onBack={() => navigation.goBack()}
        type="simple"
        rightAction={
          isEdit ? (
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowDeleteModal(true)}>
              <TrashOutlined width={24} height={24} fill={colors.red[600]} />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <CreateCycleForm formData={cycleData} setFormData={setCycleData} />
      </ScrollView>

      <ButtonBarFarm
        primaryTitle={isEdit ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
        secondaryTitle="Hủy"
        onPrimaryPress={handleCreate}
        onSecondaryPress={() => navigation.goBack()}
        primaryDisabled={isEdit && JSON.stringify(cycleData) === JSON.stringify(initialData)}
      />

      <ConfirmationDeleteModal
        visible={showDeleteModal}
        onConfirm={onConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Xác nhận xóa chu kỳ nuôi"
        message="Bạn sẽ không thể truy cập lại chu kỳ đã xóa. Các vật tư đã xuất kho cho chu kỳ này sẽ có thể bị ảnh hưởng. Bạn có chắc chắn mốn xóa chu kỳ này không?"
        confirmText="Xóa chu kỳ"
        cancelText="Không"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF4D4F',
  },
});

export default CreateCycleScreen;
