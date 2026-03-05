import React from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { ShrimpInspectionMeta, JobExecution } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { convertShrimpInspectionMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { useShrimpHealthChecksAsJobs } from '@/features/farm/hooks/useShrimpHealthCheckData';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'PondworkLogScreen'>;

export const PondworkLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId } = route.params || {};

    const [startDate, setStartDate] = React.useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = React.useState(new Date());
    const [refreshing, setRefreshing] = React.useState(false);

    const { jobs, isLoading, refetch } = useShrimpHealthChecksAsJobs(pondId || '');

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const config: LogScreenConfig<ShrimpInspectionMeta> = {
        jobType: 'SHRIMP_INSPECTION',
        pondId,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (_item: JobExecution, meta: ShrimpInspectionMeta) =>
            convertShrimpInspectionMetaToActivityData(meta).filter(i => i.label !== 'Hình ảnh:'),
        editRoute: 'ShrimpHealthScreen',
        getEditParams: (_pond, item) => ({ pondId, zoneId, shrimpHealthId: item.id }),
    };

    const { groupedData } = useLogScreenData(config);

    const handleStartInspection = () => {
        if (!pondId || !zoneId) return;
        navigation.navigate('ShrimpHealthScreen', { pondId, zoneId, shrimpHealthId: undefined });
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
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
