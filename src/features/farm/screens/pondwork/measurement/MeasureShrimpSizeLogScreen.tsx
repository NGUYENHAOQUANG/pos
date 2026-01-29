import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { MeasureSizeMeta, JobExecution } from '@/features/farm/types/farm.types';
import { convertMeasureSizeMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useSizeMeasurementsAsJobs } from '@/features/farm/hooks/useSizeMeasurement';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeLogScreen'>;

export const MeasureShrimpSizeLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pond } = params || {};

    const [startDate, setStartDate] = React.useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = React.useState(new Date());

    const [refreshing, setRefreshing] = React.useState(false);

    const { jobs, isLoading, refetch } = useSizeMeasurementsAsJobs(pond?.id, {
        CreateAtFrom: startDate.toISOString(),
        CreateAtTo: endDate.toISOString(),
    });

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            refetch();
            await refetch();
            setRefreshing(false);
        }, 500);
    }, [refetch]);

    const config: LogScreenConfig<MeasureSizeMeta> = {
        jobType: 'MEASURE_SIZE',
        pond,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution, meta: MeasureSizeMeta) =>
            convertMeasureSizeMetaToActivityData(item, meta),
        editRoute: 'MeasureShrimpSizeScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { groupedData } = useLogScreenData(config);

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
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
