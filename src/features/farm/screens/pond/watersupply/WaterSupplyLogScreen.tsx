import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { convertWaterSupplyMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution, WaterSupplyMeta } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupplyLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyLogScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const config: LogScreenConfig<WaterSupplyMeta> = {
    jobType: 'WATER_CHANGE',
    pond,
    metaConverter: (item: JobExecution, meta: WaterSupplyMeta) =>
      convertWaterSupplyMetaToActivityData(item, meta),
    editRoute: 'WaterSupply',
    getEditParams: (pondData, item) => ({ pond: pondData, item }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleCreateNew = () => {
    if (pond) {
      navigation.navigate('WaterSupply', { pond });
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký thay/cấp nước"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu thay/cấp nước"
      emptyButtonTitle="Bắt đầu thay/cấp nước"
      onEmptyButtonPress={handleCreateNew}
      useFlatCardStyle={true}
    />
  );
};
