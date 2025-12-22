import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { HarvestMeta } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertHarvestMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobExecution } from '@/features/farm/types/farm.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HarvestLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HarvestLogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const config: LogScreenConfig<HarvestMeta> = {
    jobType: 'HARVEST',
    pond,
    metaConverter: (item: JobExecution, meta: HarvestMeta) =>
      convertHarvestMetaToActivityData(item, meta),
    itemFilter: (_item, meta) => meta?.harvestType === 'Thu tỉa',
    editRoute: 'AddHarvestScreen',
    getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleStartHarvest = () => {
    if (pond) {
      navigation.navigate('AddHarvestScreen', { pond });
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký thu hoạch"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu thu hoạch"
      emptyButtonTitle="Bắt đầu thu hoạch"
      onEmptyButtonPress={handleStartHarvest}
    />
  );
};
