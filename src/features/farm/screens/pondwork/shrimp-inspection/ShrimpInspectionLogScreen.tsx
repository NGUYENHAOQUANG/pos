import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertShrimpInspectionMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';
import { JobExecution } from '@/features/farm/types/farm.types';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondworkLogScreen'>;

export const PondworkLogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const config: LogScreenConfig<ShrimpInspectionMeta> = {
    jobType: 'SHRIMP_INSPECTION',
    pond,
    metaConverter: (_item: JobExecution, meta: ShrimpInspectionMeta) =>
      convertShrimpInspectionMetaToActivityData(meta),
    editRoute: 'ShrimpInspectionScreen',
    getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
  };

  const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

  const handleStartInspection = () => {
    if (pond) {
      navigation.navigate('ShrimpInspectionScreen', { pond });
    }
  };

  return (
    <BaseLogScreen
      title="Nhật ký kiểm tra tôm"
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      groupedData={groupedData}
      emptyMessage="Chưa có dữ liệu kiểm tra tôm"
      emptyButtonTitle="Bắt đầu kiểm tra tôm"
      onEmptyButtonPress={handleStartInspection}
      customEmptyState={
        <MaterialEmptyState tab="shrimp-inspection" onPress={handleStartInspection} />
      }
    />
  );
};
