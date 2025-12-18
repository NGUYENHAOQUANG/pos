import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/context/FarmContext';
import { SelectedMaterialItem } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddWaterTreatmentScreen'>;

export const AddWaterTreatmentScreens: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};
  const pondId = pond?.id;
  const { updatePondJob, getPondJobItems } = useFarm();

  const [executionDate, setExecutionDate] = useState<Date>(new Date());
  const [activityType, setActivityType] = useState<string>('Đánh khoáng');
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  const [note, setNote] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (pondId) {
      // Save with key 'WATER_TREATMENT'
      // Check key in context if needed
      const currentItems = getPondJobItems(pondId, 'WATER_TREATMENT');

      let maxIndex = 0;
      currentItems.forEach(item => {
        // Pattern label for water treatment might be different, using similar logic to create unique label
        const match = item.label.match(/Lần (\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) maxIndex = index;
        }
      });
      const nextIndex = maxIndex + 1;

      const timeString = executionDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateString = executionDate.toLocaleDateString('en-GB');

      const newItem = {
        id: Date.now().toString(),
        label: `Lần ${nextIndex}`,
        time: timeString,
        date: dateString,
        note: note,
        waterTreatmentType: activityType,
        materials: selectedMaterials,
      };

      updatePondJob(pondId, 'WATER_TREATMENT', [...currentItems, newItem]);
    }

    console.log('Save Water Treatment', {
      pondId,
      executionDate,
      activityType,
      selectedMaterials,
      note,
    });

    Toast.show({
      type: 'success',
      text1: 'Đã xử lý nước thành công',
      position: 'top',
      visibilityTime: 3000,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <HeaderFarm type="simple" title="Xử lý nước" onBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.flex1}>
          {/* Main Content Component */}
          <WaterTreatment
            executionDate={executionDate}
            onExecutionDateChange={setExecutionDate}
            activityType={activityType}
            onActivityTypeChange={setActivityType}
            selectedMaterials={selectedMaterials}
            onSelectedMaterialsChange={setSelectedMaterials}
            note={note}
            onNoteChange={setNote}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Buttons */}
      <ButtonBarFarm
        primaryTitle="Lưu thông tin"
        secondaryTitle="Huỷ"
        onPrimaryPress={handleSave}
        onSecondaryPress={handleBack}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
