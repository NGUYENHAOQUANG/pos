import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { convertWaterTreatmentJobToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterTreatmentLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterTreatmentLogScreens = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pondId, pond } = route.params || {};
  const targetPondId = pondId || pond?.id;

  const config: LogScreenConfig = {
    jobType: 'WATER_TREATMENT',
    pond: pond, // Pass pond object if available, otherwise use pondId
    pondId: targetPondId,
    metaConverter: (item: JobExecution) => convertWaterTreatmentJobToActivityData(item),
    editRoute: 'EditWaterTreatmentScreens',
    getEditParams: (_pond, item) => ({ pondId: targetPondId!, jobId: item.id }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleStartActivity = () => {
    if (pond) {
      navigation.navigate('AddWaterTreatmentScreen', { pond });
    } else if (targetPondId) {
      // Handle case when only pondId is available
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký xử lý nước"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu xử lý nước"
      emptyButtonTitle="Thêm hoạt động"
      onEmptyButtonPress={handleStartActivity}
      useFlatCardStyle={true}
    />
  );
};
