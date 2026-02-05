import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useFeedingRecordsAsJobs } from '@/features/farm/hooks/feed/useFeeding';
import { convertFeedJobToActivityData } from '@/features/farm/utils/metaConverters';
import { JobExecution } from '@/features/farm/types/farm.types';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedingLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const FeedingLogScreens = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId } = route.params || {};

    // Fetch data from API
    const { jobs: apiJobs } = useFeedingRecordsAsJobs(pondId || '');

    const config: LogScreenConfig = {
        jobType: 'FEED',
        pondId,
        metaConverter: (item: JobExecution) => convertFeedJobToActivityData(item),
        editRoute: 'EditFeeder',
        getEditParams: (_pond, item) => ({ pondId: pondId!, jobId: item.id }),
        externalData: apiJobs,
    };

    const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);

    const handleStartFeeding = () => {
        if (pondId) {
            navigation.navigate('FeedTheShrimp', { pondId });
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
