import React from 'react';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { convertWaterTreatmentJobToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { useWaterTreatmentRecordsAsJobs } from '@/features/farm/hooks/useWaterTreatmentRecords';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';
import { useAppTheme } from '@/styles/themeContext';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterTreatmentLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterTreatmentLogScreens = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, pond } = route.params || {};
    const targetPondId = pondId || pond?.id || '';

    const theme = useAppTheme();
    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    // Fetch data from API with date params
    const { jobs, isLoading, refetch } = useWaterTreatmentRecordsAsJobs(targetPondId, {
        CreateAtFrom: dateParams.CreateAtFrom,
        CreateAtTo: dateParams.CreateAtTo,
    });

    // Auto refetch when screen is focused (e.g. back from Edit)
    useFocusEffect(
        React.useCallback(() => {
            if (targetPondId) {
                refetch();
            }
        }, [targetPondId, refetch])
    );

    const config: LogScreenConfig = {
        jobType: 'WATER_TREATMENT',
        pond: pond,
        pondId: targetPondId,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution) => convertWaterTreatmentJobToActivityData(item),
        editRoute: 'EditWaterTreatmentScreens',
        getEditParams: (_pond, item) => ({
            pondId: targetPondId!,
            jobId: item.id,
            pond: pond,
            item,
        }),
        externalData: jobs, // Use real API data instead of store
    };

    const { groupedData } = useLogScreenData(config);

    const handleStartActivity = () => {
        if (pond) {
            navigation.navigate('AddWaterTreatmentScreen', { pond });
        }
    };

    if (isLoading && !jobs.length) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <BaseLogScreen
            title="Nhật ký xử lý nước"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu xử lý nước"
            emptyButtonTitle="Bắt đầu ghi xử lý nước"
            onEmptyButtonPress={handleStartActivity}
            useFlatCardStyle={true}
        />
    );
};
