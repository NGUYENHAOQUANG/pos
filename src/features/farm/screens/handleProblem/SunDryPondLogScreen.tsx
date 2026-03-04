import React, { useState, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useDryRenovationsAsJobs } from '@/features/farm/hooks/useDryRenovation';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { useFarmStore } from '@/features/farm/store/farmStore';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'SunDryPondLog'>;

export const SunDryPondLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pondId } = params || {};

    // Get pond from store
    const pond = useFarmStore(state => state.getPondById(pondId));

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState(new Date());

    const [refreshing, setRefreshing] = useState(false);

    const { jobs, isLoading, refetch } = useDryRenovationsAsJobs(pondId, {
        createAtFrom: startDate.toISOString(),
        createAtTo: endDate.toISOString(),
        page: 1,
        limit: 1000,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            refetch();
            await refetch();
            setRefreshing(false);
        }, 500);
    }, [refetch]);

    const config: LogScreenConfig<any> = {
        jobType: 'SUN_DRY_POND',
        pond,
        pondId,
        externalData: jobs,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        metaConverter: (item: JobExecution) => {
            const data: ActivityData[] = [];
            if (item.materials && item.materials.length > 0) {
                item.materials.forEach(m => {
                    data.push({
                        label: m.material.name,
                        value: m.quantity.toString(),
                        unit: m.unit,
                    });
                });
            }
            return data;
        },
        editRoute: 'HandleProblem',
        getEditParams: (_, item) => ({ pondId, item, jobType: 'SUN_DRY_POND' }),
    };

    const { groupedData } = useLogScreenData(config);

    const handleNavigateToCreate = () => {
        if (pondId) {
            navigation.navigate('HandleProblem', { pondId, jobType: 'SUN_DRY_POND' });
        }
    };

    return (
        <BaseLogScreen
            title="Nhật ký phơi ao"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu phơi ao"
            emptyButtonTitle="Bắt đầu phơi ao"
            onEmptyButtonPress={handleNavigateToCreate}
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
