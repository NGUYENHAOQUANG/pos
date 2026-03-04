import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { ALLOWED_JOBS_WHEN_NO_CYCLE, APP_CONFIG } from '@/shared/constants/config';
import { useActiveCycle, useCyclesByPond } from '@/features/farm/hooks/useCycle';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { PondDetail } from '@/features/farm/screens/pond-detail/PondDetail';

import { JobExecution, JOB_TYPES } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { useSizeMeasurementsAsJobs } from '@/features/farm/hooks/useSizeMeasurement';
import { useSiphonRecordsAsJobs } from '@/features/farm/hooks/useSiphonRecords';
import { useShrimpHealthChecksAsJobs } from '@/features/farm/hooks/useShrimpHealthCheckData';
import { useEnvMeasurementsAsJobs } from '@/features/farm/hooks/useEnvMeasurement';
import { useIncidentsAsJobs } from '@/features/farm/hooks/useIncidentData';
import { useCleanRenovationsAsJobs } from '@/features/farm/hooks/useCleanRenovation';
import { useDryRenovationsAsJobs } from '@/features/farm/hooks/useDryRenovation';
import { useWaterSupplyRecordsAsJobs } from '@/features/farm/hooks/useWaterChangeRecords';
import { useWaterTreatmentRecordsAsJobs } from '@/features/farm/hooks/useWaterTreatmentRecords';
import { useFeedingRecordsAsJobs } from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { useHarvestRecordsAsJobs } from '@/features/farm/hooks/useHarvestRecord';
import { useStockTransfersAsJobs } from '@/features/farm/hooks/useStockTransfer';
import { usePondOperations } from '@/features/farm/hooks/usePondOperations';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import { usePondCategories } from '@/features/farm/hooks/usePondCategories';
import { pondListService } from '@/features/farm/services/pondListService';
import {
    usePondJobNavigateHandlers,
    usePondJobEditHandlers,
    usePondJobLogHandlers,
} from '@/features/farm/hooks/usePondJobHandlers';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'PondDetail'>;

export const PondDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId } = route.params || {};

    useEffect(() => {
        console.log('pondId', pondId);
        console.log('zoneId', zoneId);
    }, [pondId, zoneId]);

    const [selectedTab, setSelectedTab] = useState<string>('work');
    const [isMeasureSizeModalVisible, setIsMeasureSizeModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { setTabBarVisible } = useTabBarVisibility();

    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const updatePondJob = useFarmStore(state => state.updatePondJob);

    const { data: pondFromApi, isLoading: isLoadingPond } = usePondDetail(zoneId, pondId);

    const { data: categoriesResponse, isLoading: isLoadingCategories } = usePondCategories();
    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);

    const pond = useMemo(() => {
        if (!pondFromApi) return undefined;
        if (!categories.length) return pondFromApi;
        return pondListService.mapPondsWithCategories([pondFromApi], categories)[0] || pondFromApi;
    }, [pondFromApi, categories]);

    const { jobs: apiMeasureSizeJobs } = useSizeMeasurementsAsJobs(pondId);
    const { jobs: apiShrimpInspectionJobs } = useShrimpHealthChecksAsJobs(pondId);
    const { jobs: apiSiphonJobs } = useSiphonRecordsAsJobs(pondId);
    const { jobs: apiEnvJobs } = useEnvMeasurementsAsJobs(pondId, new Date());
    const { jobs: apiIncidentJobs } = useIncidentsAsJobs(pondId);
    const { jobs: apiCleanRenovationJobs } = useCleanRenovationsAsJobs(pondId);
    const { jobs: apiDryRenovationJobs } = useDryRenovationsAsJobs(pondId);
    const { jobs: apiWaterSupplyJobs } = useWaterSupplyRecordsAsJobs(pondId);
    const { jobs: apiWaterTreatmentJobs } = useWaterTreatmentRecordsAsJobs(pondId);
    const { jobs: apiFeedingJobs } = useFeedingRecordsAsJobs(pondId);
    const { jobs: apiHarvestJobs } = useHarvestRecordsAsJobs(pondId);
    const { jobs: apiTransferJobs } = useStockTransfersAsJobs(pondId);

    let pondTypeId: string | null = null;
    if (pond?.type) {
        pondTypeId = pond.type.id;
    }

    const { data: pondOperations, isLoading: isLoadingOperations } = usePondOperations(
        pondTypeId ? { PondCategoryId: pondTypeId } : undefined
    );

    const isLoading =
        isLoadingPond || isLoadingCategories || (pondTypeId !== null && isLoadingOperations);

    const jobs = useMemo(() => {
        if (!pondTypeId || !pondOperations || pondOperations.length === 0) {
            return [];
        }

        const apiItemsByJobType: Partial<Record<JobType, JobExecution[]>> = {
            [JOB_TYPES.FEED]: apiFeedingJobs,
            [JOB_TYPES.MEASURE_SIZE]: apiMeasureSizeJobs,
            [JOB_TYPES.SHRIMP_INSPECTION]: apiShrimpInspectionJobs,
            [JOB_TYPES.SIPHON]: apiSiphonJobs,
            [JOB_TYPES.ENVIRONMENT]: apiEnvJobs,
            [JOB_TYPES.TROUBLESHOOTING]: apiIncidentJobs,
            [JOB_TYPES.CLEAN_POND]: apiCleanRenovationJobs,
            [JOB_TYPES.SUN_DRY_POND]: apiDryRenovationJobs,
            [JOB_TYPES.WATER_CHANGE]: apiWaterSupplyJobs,
            [JOB_TYPES.WATER_TREATMENT]: apiWaterTreatmentJobs,
            [JOB_TYPES.HARVEST]: apiHarvestJobs,
            [JOB_TYPES.TRANSFER_POND]: apiTransferJobs,
        };

        return pondDetailService.mapJobsWithPriorities(pondOperations, apiItemsByJobType, jobType =>
            pond?.id ? getPondJobItems(pond.id, jobType) : []
        );
    }, [
        pondTypeId,
        pondOperations,
        pond?.id,
        getPondJobItems,
        apiFeedingJobs,
        apiMeasureSizeJobs,
        apiShrimpInspectionJobs,
        apiSiphonJobs,
        apiEnvJobs,
        apiIncidentJobs,
        apiCleanRenovationJobs,
        apiDryRenovationJobs,
        apiWaterSupplyJobs,
        apiWaterTreatmentJobs,
        apiHarvestJobs,
        apiTransferJobs,
    ]);

    const effectiveZoneId = pond?.zoneId?.toString();
    const { data: warehouses } = useWarehouses({
        PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
        ZoneId: effectiveZoneId,
    });

    const { data: shrimpSeeds } = useShrimpSeeds(warehouses?.[0]?.id);

    const { data: currentCycle } = useActiveCycle(pond?.id || '');

    const {
        refetch: refetchCycles,
        isRefetching: isRefetchingCycles,
        data: cyclesData,
    } = useCyclesByPond(pond?.id || '');
    const cycles = useMemo(() => cyclesData?.data?.items || [], [cyclesData]);

    const filteredJobs = useMemo(() => {
        if (currentCycle) return jobs;
        return jobs.filter(job => ALLOWED_JOBS_WHEN_NO_CYCLE.includes((job as any).type));
    }, [jobs, currentCycle]);

    useEffect(() => {
        setTabBarVisible(false);
        return () => {
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    useFocusEffect(
        useCallback(() => {
            refetchCycles();
        }, [refetchCycles])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchCycles();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refetchCycles]);

    const handleTransferPond = useCallback(() => {
        if (!pond || !pond.id) return;

        const measureSizeItems = apiMeasureSizeJobs;
        if (measureSizeItems.length === 0) {
            setIsMeasureSizeModalVisible(true);
            return;
        }

        const latestShrimpSize = pondDetailService.getLatestShrimpSize(apiMeasureSizeJobs);

        const cycleData = currentCycle || cycles[0] || null;

        navigation.navigate('AddTransferScreen', {
            pond,
            latestShrimpSize,
            cycleData,
        });
    }, [pond, apiMeasureSizeJobs, setIsMeasureSizeModalVisible, currentCycle, cycles, navigation]);

    const navigateHandlers = usePondJobNavigateHandlers({
        pond,
        handleTransferPond,
    });

    const editHandlers = usePondJobEditHandlers({
        pond,
    });

    const logHandlers = usePondJobLogHandlers({
        pond,
    });

    const handleAddJobItem = useCallback(
        (type: JobType) => {
            if (!pond?.id) return;

            const handler = navigateHandlers[type];
            if (handler) {
                handler();
                return;
            }

            const currentItems = getPondJobItems(pond.id, type);
            const newItem = pondDetailService.generateNextJobItem(currentItems, pond.id);
            updatePondJob(pond.id, type, [...currentItems, newItem]);
        },
        [pond, navigateHandlers, getPondJobItems, updatePondJob]
    );

    const handleEditJobItem = useCallback(
        (type: JobType, item: JobExecution) => {
            if (!pond?.id) return;

            const handler = editHandlers[type];
            if (handler) {
                handler(item);
                return;
            }

            const currentItems = getPondJobItems(pond.id, type);
            const newItems = currentItems.filter(i => i.id !== item.id);
            updatePondJob(pond.id, type, newItems);
        },
        [pond, editHandlers, getPondJobItems, updatePondJob]
    );

    const handleJobPress = useCallback(
        (type: JobType) => {
            if (!pond?.id) return;

            const handler = logHandlers[type];
            if (handler) {
                handler();
            }
        },
        [pond, logHandlers]
    );

    const onBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onGoToPondInfo = useCallback(() => {
        if (!pond) return;
        navigation.navigate('PondInfo', { pond });
    }, [navigation, pond]);

    const onEditCycle = useCallback(() => {
        navigation.navigate('CycleDetailScreen', {
            pondId: pond?.id || '',
            zoneId: pond?.zoneId?.toString() ?? '',
            warehouseId: warehouses?.[0]?.id ?? '',
        });
    }, [navigation, pond, warehouses]);

    const onGoToMeasureSizeScreen = useCallback(() => {
        if (!pond) return;
        setIsMeasureSizeModalVisible(false);
        navigation.navigate('MeasureShrimpSizeScreen', { pond });
    }, [navigation, pond]);

    const handleStartCycle = useCallback(() => {
        if (pond?.id) {
            navigation.navigate('CreateCycle', {
                pondId: pond.id,
                zoneId: pond.zoneId!,
            });
        }
    }, [navigation, pond]);

    return (
        <PondDetail
            pond={pond}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            isLoading={isLoading}
            isRefetchingCycles={isRefetchingCycles}
            refreshing={refreshing}
            onRefresh={onRefresh}
            currentCycle={currentCycle}
            filteredJobs={filteredJobs}
            onBack={onBack}
            onGoToPondInfo={onGoToPondInfo}
            onStartCycle={handleStartCycle}
            onEditCycle={onEditCycle}
            breedName={pondDetailService.getBreedName(currentCycle, shrimpSeeds)}
            transferBreedName={pondDetailService.getTransferBreedName(currentCycle, shrimpSeeds)}
            handleJobPress={handleJobPress}
            handleAddJobItem={handleAddJobItem}
            handleEditJobItem={handleEditJobItem}
            isMeasureSizeModalVisible={isMeasureSizeModalVisible}
            setIsMeasureSizeModalVisible={setIsMeasureSizeModalVisible}
            onGoToMeasureSizeScreen={onGoToMeasureSizeScreen}
            jobs={jobs}
        />
    );
};
