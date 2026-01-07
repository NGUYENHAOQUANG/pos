import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { MeasureSizeMeta, JobExecution } from '@/features/farm/types/farm.types';
import { convertMeasureSizeMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeLogScreen'>;

export const MeasureShrimpSizeLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pond } = params || {};

    const config: LogScreenConfig<MeasureSizeMeta> = {
        jobType: 'MEASURE_SIZE',
        pond,
        metaConverter: (item: JobExecution, meta: MeasureSizeMeta) =>
            convertMeasureSizeMetaToActivityData(item, meta),
        editRoute: 'MeasureShrimpSizeScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

    const handleNavigateToCreate = () => {
        if (pond) {
            navigation.navigate('MeasureShrimpSizeScreen', { pond });
        }
    };

    return (
        <BaseLogScreen
            title="Nhật ký đo kích thước tôm"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu đo kích thước tôm"
            emptyButtonTitle="Bắt đầu đo kích thước tôm"
            onEmptyButtonPress={handleNavigateToCreate}
        />
    );
};
