import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SiphonMeta } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertSiphonMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobExecution } from '@/features/farm/types/farm.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'SiphonLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const SiphonLogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const config: LogScreenConfig<SiphonMeta> = {
    jobType: 'SIPHON',
    pond,
    metaConverter: (item: JobExecution, meta: SiphonMeta) =>
      convertSiphonMetaToActivityData(item, meta),
    editRoute: 'AddSiphonScreen',
    getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleStartSiphon = () => {
    if (pond) {
      navigation.navigate('AddSiphonScreen', { pond });
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký xi-phông"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu xi-phông"
      emptyButtonTitle="Bắt đầu xi-phông"
      onEmptyButtonPress={handleStartSiphon}
    />
  );
};
