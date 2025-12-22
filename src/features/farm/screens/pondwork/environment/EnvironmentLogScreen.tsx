import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { EnvironmentMeta } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertEnvironmentMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'EnvironmentLogScreen'>;

export const EnvironmentLogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const config: LogScreenConfig<EnvironmentMeta> = {
    jobType: 'ENVIRONMENT',
    pond,
    metaConverter: (_item, meta) => convertEnvironmentMetaToActivityData(meta),
    editRoute: 'AddEnvironmentScreen',
    getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleStartEnvironment = () => {
    if (pond) {
      navigation.navigate('AddEnvironmentScreen', { pond });
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký đo môi trường"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu đo môi trường"
      emptyButtonTitle="Bắt đầu đo thông số môi trường"
      onEmptyButtonPress={handleStartEnvironment}
    />
  );
};
