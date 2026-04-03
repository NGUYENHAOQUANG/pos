import React from 'react';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { convertEnvironmentMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution, EnvironmentMeta } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { useEnvMeasurementsAsJobs } from '@/features/farm/hooks/useEnvMeasurement';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/styles';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EnvironmentLogScreen'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const EnvironmentLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const pondId = pond?.id || '';

    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    // Fetch data using standardized hook with date params
    const { jobs, isLoading, refetch } = useEnvMeasurementsAsJobs(pondId, {
        CreateAtFrom: dateParams.CreateAtFrom,
        CreateAtTo: dateParams.CreateAtTo,
    });

    // Auto refetch when screen is focused (e.g. back from Edit)
    useFocusEffect(
        React.useCallback(() => {
            if (pondId) {
                refetch();
            }
        }, [pondId, refetch])
    );

    const config: LogScreenConfig<EnvironmentMeta> = {
        jobType: 'ENVIRONMENT',
        pond,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (_item: JobExecution, meta: EnvironmentMeta) =>
            convertEnvironmentMetaToActivityData(meta),
        editRoute: 'AddEnvironmentScreen',
        getEditParams: (pondData, item) => ({
            pondId: pondData.id,
            environmentId: item.id,
        }),
        externalData: jobs,
    };

    const { groupedData } = useLogScreenData(config);

    const handleCreateNew = () => {
        if (pond) {
            navigation.navigate('AddEnvironmentScreen', { pondId: pond.id });
        }
    };

    if (isLoading && !jobs.length) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
            onEmptyButtonPress={handleCreateNew}
            isLoading={isLoading}
        />
    );
};
