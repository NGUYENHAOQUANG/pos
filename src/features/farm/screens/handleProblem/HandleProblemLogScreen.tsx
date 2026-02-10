import React, { useState, useCallback, useMemo } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useLogScreenData, LogScreenConfig } from '@/features/farm/hooks/useLogScreenData';
import { useCleanRenovationsAsJobs } from '@/features/farm/hooks/useCleanRenovation';
import { useDryRenovationsAsJobs } from '@/features/farm/hooks/useDryRenovation';
import { useIncidentsAsJobs } from '@/features/farm/hooks/useIncidentData';
import { ActivityData } from '@/features/farm/components/ActivityCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblemLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemLogScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, jobType = 'CLEAN_POND' } = route.params || {};

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const currentJobType: JobType = jobType as JobType;
    const pondId = pond?.id || '';

    const cleanDryDateParams = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return {
            createAtFrom: start.toISOString(),
            createAtTo: end.toISOString(),
            page: 1,
            limit: 1000,
        };
    }, [startDate, endDate]);

    const incidentDateParams = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return {
            CreateAtFrom: start.toISOString(),
            CreateAtTo: end.toISOString(),
            page: 1,
            limit: 100,
        };
    }, [startDate, endDate]);

    const {
        jobs: cleanJobs,
        isLoading: cleanLoading,
        refetch: refetchClean,
    } = useCleanRenovationsAsJobs(
        currentJobType === 'CLEAN_POND' ? pondId : '',
        currentJobType === 'CLEAN_POND' ? cleanDryDateParams : undefined
    );

    const {
        jobs: dryJobs,
        isLoading: dryLoading,
        refetch: refetchDry,
    } = useDryRenovationsAsJobs(
        currentJobType === 'SUN_DRY_POND' ? pondId : '',
        currentJobType === 'SUN_DRY_POND' ? cleanDryDateParams : undefined
    );

    const {
        jobs: incidentJobs,
        isLoading: incidentLoading,
        refetch: refetchIncidents,
    } = useIncidentsAsJobs(
        currentJobType === 'TROUBLESHOOTING' ? pondId : '',
        currentJobType === 'TROUBLESHOOTING' ? incidentDateParams : undefined
    );

    const jobs =
        currentJobType === 'CLEAN_POND'
            ? cleanJobs
            : currentJobType === 'SUN_DRY_POND'
            ? dryJobs
            : incidentJobs;

    const isLoading = cleanLoading || dryLoading || incidentLoading;

    const refetch = useCallback(() => {
        if (currentJobType === 'CLEAN_POND') return refetchClean();
        if (currentJobType === 'SUN_DRY_POND') return refetchDry();
        return refetchIncidents();
    }, [currentJobType, refetchClean, refetchDry, refetchIncidents]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            await refetch();
            setRefreshing(false);
        }, 500);
    }, [refetch]);

    const getTitle = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Nhật ký Rửa ao';
            case 'SUN_DRY_POND':
                return 'Nhật ký Phơi ao';
            case 'TROUBLESHOOTING':
                return 'Nhật ký Xử lý sự cố';
            default:
                return 'Nhật ký Xử lý sự cố';
        }
    };

    const config: LogScreenConfig<any> = {
        jobType: currentJobType,
        pond,
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
            if (item.note) {
                data.push({
                    label: 'Ghi chú',
                    value: item.note,
                });
            }
            return data;
        },
        editRoute: 'HandleProblem',
        getEditParams: (pondData, item) => ({
            pond: pondData,
            item,
            jobType: currentJobType as any,
        }),
    };

    const { groupedData } = useLogScreenData(config);

    const getButtonTitle = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Bắt đầu rửa ao';
            case 'SUN_DRY_POND':
                return 'Bắt đầu phơi ao';
            case 'TROUBLESHOOTING':
                return 'Bắt đầu ghi lại sự cố';
            default:
                return 'Bắt đầu ghi lại sự cố';
        }
    };

    const getEmptyMessage = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Chưa có dữ liệu rửa ao';
            case 'SUN_DRY_POND':
                return 'Chưa có dữ liệu phơi ao';
            case 'TROUBLESHOOTING':
                return 'Chưa có dữ liệu xử lý sự cố';
            default:
                return 'Chưa có dữ liệu xử lý sự cố';
        }
    };

    const screenTitle = getTitle();
    const emptyMessage = getEmptyMessage();
    const buttonTitle = getButtonTitle();

    const handleCreateNew = () => {
        if (pond) navigation.navigate('HandleProblem', { pond, jobType: currentJobType as any });
    };

    return (
        <BaseLogScreen
            title={screenTitle}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage={emptyMessage}
            emptyButtonTitle={buttonTitle}
            onEmptyButtonPress={handleCreateNew}
            useFlatCardStyle={true}
            isLoading={isLoading || refreshing}
            isRefreshing={refreshing}
            onRefresh={onRefresh}
        />
    );
};
