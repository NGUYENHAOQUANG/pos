import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { HarvestMeta, JobExecution } from '@/features/farm/types/farm.types';
import { convertHarvestMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useHarvestRecordsAsJobs } from '@/features/farm/hooks/useHarvestRecord';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'HarvestLog'>;

export const HarvestLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pond } = params || {};

    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    const [refreshing, setRefreshing] = React.useState(false);

    const { jobs, isLoading, refetch } = useHarvestRecordsAsJobs(pond?.id || '', dateParams);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            refetch();
            await refetch();
            setRefreshing(false);
        }, 500);
    }, [refetch]);

    const config: LogScreenConfig<HarvestMeta> = {
        jobType: 'HARVEST',
        pond,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution, meta: HarvestMeta) =>
            convertHarvestMetaToActivityData(item, meta),
        editRoute: 'AddHarvestScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { groupedData } = useLogScreenData(config);

    const handleNavigateToCreate = () => {
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
            onEmptyButtonPress={handleNavigateToCreate}
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
