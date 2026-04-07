import React from 'react';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { convertWaterSupplyMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution, WaterSupplyMeta } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

// Hooks
import { useWaterSupplyRecordsAsJobs } from '@/features/farm/hooks/useWaterChangeRecords';
import { ActivityIndicator, View } from 'react-native';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';
import { useAppTheme } from '@/styles/themeContext';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupplyLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyLogScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const pondId = pond?.id || '';

    const theme = useAppTheme();
    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();

    // Fetch data using the hook with date params
    const { jobs, isLoading, isFetching, refetch } = useWaterSupplyRecordsAsJobs(pondId, {
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

    const config: LogScreenConfig<WaterSupplyMeta> = {
        jobType: 'WATER_CHANGE',
        pond,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution, meta: WaterSupplyMeta) =>
            convertWaterSupplyMetaToActivityData(item, meta),
        editRoute: 'WaterSupply',
        getEditParams: (pondData, item) => ({ pond: pondData, item }),
        externalData: jobs, // Use real API data
    };

    const { groupedData } = useLogScreenData(config);

    const handleCreateNew = () => {
        if (pond) {
            navigation.navigate('WaterSupply', { pond });
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
            isLoading={isLoading}
            isRefreshing={isFetching && !isLoading}
            onRefresh={refetch}
        />
    );
};
