import React, { useMemo, useCallback } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { TrackingGroup } from '@/features/farm/components/TrackingList';
import { useEnvMeasurements } from '@/features/farm/hooks/useEnvMeasurement';
import { useEnvironmentInit } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';
import { APP_CONFIG } from '@/shared/constants/config';
import { groupMeasurements } from '@/features/farm/services/environment-log.service';
import { IEnvMeasurement } from '@/features/farm/types/envMeasurement.types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'EnvironmentLogScreen'>;

export const EnvironmentLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    // --- Zone ID ---
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { metricTypes } = useEnvironmentInit(selectedZoneId!);

    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    const params = useMemo(
        () => ({
            ...dateParams,
            PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
            OrderBy: 'CreatedAt desc',
        }),
        [dateParams]
    );

    const { data: envMeasurementsData, isLoading } = useEnvMeasurements(pond?.id || '', params);

    const handleEdit = useCallback(
        (measurement: IEnvMeasurement) => {
            if (pond) {
                navigation.navigate('AddEnvironmentScreen', {
                    pondId: measurement.pondId,
                    environmentId: measurement.id,
                });
            }
        },
        [pond, navigation]
    );

    const groupedData: TrackingGroup[] = useMemo(() => {
        if (!envMeasurementsData?.data?.items || metricTypes.length === 0) return [];
        return groupMeasurements(envMeasurementsData.data.items, metricTypes, handleEdit);
    }, [envMeasurementsData, metricTypes, handleEdit]);

    const handleStartEnvironment = () => {
        if (pond) {
            navigation.navigate('AddEnvironmentScreen', { pondId: pond.id });
        }
    };

    return (
        <BaseLogScreen
            title={'Nhật ký đo\nthông số môi trường'}
            titleNumberOfLines={2}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu đo thông số môi trường"
            emptyButtonTitle="Bắt đầu đo thông số môi trường"
            onEmptyButtonPress={handleStartEnvironment}
            isLoading={isLoading}
        />
    );
};
