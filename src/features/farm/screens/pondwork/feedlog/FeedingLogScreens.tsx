import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useFeedingRecordsAsJobs } from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { convertFeedJobToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedingLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const FeedingLogScreens = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId } = route.params || {};
    const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();
    const { jobs: apiJobs } = useFeedingRecordsAsJobs(pondId || '', {
        CreateAtFrom: dateParams.CreateAtFrom,
        CreateAtTo: dateParams.CreateAtTo,
    });
    const config: LogScreenConfig = {
        jobType: 'FEED',
        pondId,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution) => convertFeedJobToActivityData(item),
        editRoute: 'FeedingManagement',
        getEditParams: (_pond, item) => ({ pondId: pondId!, jobId: item.id, itemToEdit: item }),
        externalData: apiJobs,
    };
    const { groupedData } = useLogScreenData(config);
    const handleStartFeeding = () => {
        if (pondId) {
            navigation.navigate('FeedingManagement', { pondId });
        }
    };
    return (
        <BaseLogScreen
            title="Nhật ký cho ăn"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu cho ăn"
            emptyButtonTitle="Bắt đầu cho ăn"
            onEmptyButtonPress={handleStartFeeding}
            useFlatCardStyle={true}
        />
    );
};
