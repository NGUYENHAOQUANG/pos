import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/components/pond/CreateCycleForm';
import { FarmStackParamList } from '../../navigation/FarmNavigator';
import { CycleData } from '../../types/farm.types';
import { CycleProvider } from '../../context/CycleContext';
import HeaderCycle from '../../components/HeaderCycle';

type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const { pondId, initialData } = route.params;
  const isEdit = !!initialData;

  const [cycleData, setCycleData] =
    useState<Omit<CycleData, 'id'> | null>(initialData ?? null);

  // Hàm kiểm tra tính hợp lệ của dữ liệu (dùng để hiện Alert)
  const checkFields = () => {
    return (
      !!cycleData &&
      !!cycleData.breedSource &&
      !!cycleData.seasonSource &&
      !!cycleData.cycleName &&
      !!cycleData.stockingDate &&
      cycleData.stockingQuantity > 0 &&
      cycleData.age > 0
    );
  };

  const handleCreate = () => {
    // Nếu chưa đủ thông tin thì hiện cảnh báo
    if (!checkFields()) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập đầy đủ các thông tin bắt buộc trước khi tiếp tục."
      );
      return;
    }

    // Nếu đủ thông tin thì chuyển màn hình
    navigation.navigate('ShrimpFarmScreens', { cycleData });
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa chu kỳ nuôi này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: () => {
            setCycleData(null);
            navigation.goBack();
          },
          style: "destructive"
        },
      ]
    );
  };


  const isPrimaryDisabled = isEdit
    ? JSON.stringify(cycleData) === JSON.stringify(initialData)
    : false;

  return (
    <View style={styles.container}>
      <HeaderCycle
        title={isEdit ? 'Chỉnh sửa chu kỳ nuôi' : 'Tạo chu kỳ nuôi'}
        onBack={() => navigation.goBack()}
        isEdit={isEdit}
        onDelete={handleDelete}
      />

      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CycleProvider
          pondId={pondId}
          initialData={initialData}
          onChange={setCycleData}
        >
          <CreateCycleForm />
        </CycleProvider>
      </ScrollView>

      <ButtonBarFarm
        primaryTitle={isEdit ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
        secondaryTitle="Hủy"
        onPrimaryPress={handleCreate}
        onSecondaryPress={() => navigation.goBack()}
        primaryDisabled={isPrimaryDisabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  formContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default CreateCycleScreen;