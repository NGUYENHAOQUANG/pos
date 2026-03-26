import React, { useState, useCallback } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SiphonMeta, JobExecution } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertSiphonMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useSiphonRecordsAsJobs } from '@/features/farm/hooks/useSiphonRecords';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'SiphonLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const SiphonLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    const [refreshing, setRefreshing] = useState(false);

    const { jobs, isLoading, refetch } = useSiphonRecordsAsJobs(pond?.id, dateParams as any);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            // Refetch data
            await refetch();
            setRefreshing(false);
        }, 500);
    }, [refetch]);

    const config: LogScreenConfig<SiphonMeta> = {
        jobType: 'SIPHON',
        pond,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution, meta: SiphonMeta) =>
            convertSiphonMetaToActivityData(item, meta)
                .filter(i => i.label !== 'Hình ảnh')
                .map(i =>
                    i.label === 'Hao hụt trong ao'
                        ? { ...i, label: 'Số tôm hao (kg)', unit: 'kg' }
                        : i
                ),
        editRoute: 'AddSiphonScreen',
        getEditParams: (pondData, item) => ({ pond: pondData, itemToEdit: item }),
    };

    const { groupedData } = useLogScreenData(config);

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
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
