import { useMemo } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { PondData, JobExecution, JOB_TYPES } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { useSizeMeasurementsAsJobs } from '@/features/farm/hooks/useSizeMeasurement';
import { useSiphonRecordsAsJobs } from '@/features/farm/hooks/useSiphonRecords';
import { useShrimpHealthChecksAsJobs } from '@/features/farm/hooks/useShrimpHealthCheckData';
import { useEnvMeasurementsAsJobs } from '@/features/farm/hooks/useEnvMeasurement';
import { useIncidentsAsJobs } from '@/features/farm/hooks/useIncidentData';
import { useCleanRenovationsAsJobs } from '@/features/farm/hooks/useCleanRenovation';
import { useDryRenovationsAsJobs } from '@/features/farm/hooks/useDryRenovation';
import { useWaterSupplyRecordsAsJobs } from '@/features/farm/hooks/useWaterSupplyRecords';
import { useFeedingRecordsAsJobs } from '@/features/farm/hooks/feed/useFeeding';
import { useHarvestRecordsAsJobs } from './useHarvestRecord';

export const useAllPondJobs = (pond: PondData | undefined) => {
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const operationsByPondTypeRaw = useFarmStore(state => state.operationsByPondType);

    // Job maps for dependency tracking
    const feedJobs = useFarmStore(state => state.feedJobs);
    const shrimpInspectionJobs = useFarmStore(state => state.shrimpInspectionJobs);
    const measureSizeJobs = useFarmStore(state => state.measureSizeJobs);
    const environmentJobs = useFarmStore(state => state.environmentJobs);
    const waterTreatmentJobs = useFarmStore(state => state.waterTreatmentJobs);
    const waterChangeJobs = useFarmStore(state => state.waterChangeJobs);
    const siphonJobs = useFarmStore(state => state.siphonJobs);
    const troubleshootingJobs = useFarmStore(state => state.troubleshootingJobs);
    const transferPondJobs = useFarmStore(state => state.transferPondJobs);
    const cleanPondJobs = useFarmStore(state => state.cleanPondJobs);
    const sunDryJobs = useFarmStore(state => state.sunDryJobs);
    const harvestJobs = useFarmStore(state => state.harvestJobs);

    const operationsByPondType = useMemo(
        () => operationsByPondTypeRaw || {},
        [operationsByPondTypeRaw]
    );

    // Fetch size measurements from API
    const { jobs: apiMeasureSizeJobs } = useSizeMeasurementsAsJobs(pond?.id || '');
    const { jobs: apiShrimpInspectionJobs } = useShrimpHealthChecksAsJobs(pond?.id || '');
    // Fetch siphon records from API
    const { jobs: apiSiphonJobs } = useSiphonRecordsAsJobs(pond?.id || '');
    // Fetch environment measurements
    const { jobs: apiEnvJobs } = useEnvMeasurementsAsJobs(pond?.id || '', new Date());
    const { jobs: apiIncidentJobs } = useIncidentsAsJobs(pond?.id || '');
    // Fetch clean renovation records from API
    const { jobs: apiCleanRenovationJobs } = useCleanRenovationsAsJobs(pond?.id || '');
    // Fetch dry renovation records from API
    const { jobs: apiDryRenovationJobs } = useDryRenovationsAsJobs(pond?.id || '');
    // Fetch water supply records from API
    const { jobs: apiWaterSupplyJobs } = useWaterSupplyRecordsAsJobs(pond?.id || '');
    // Fetch feeding records from API
    const { jobs: apiFeedingJobs } = useFeedingRecordsAsJobs(pond?.id || '');
    // Fetch harvest records from API
    const { jobs: apiHarvestJobs } = useHarvestRecordsAsJobs(pond?.id || '');

    // Get job types from API only (no fallback)
    const jobs = useMemo(() => {
        // Get pondTypeId from pond
        let pondTypeId: string | null = null;
        if (pond?.type) {
            if (typeof pond.type === 'object') {
                pondTypeId = pond.type.id;
            } else if (typeof pond.type === 'string') {
                pondTypeId = pond.type;
            }
        }

        // Get operations from API data
        if (pondTypeId && operationsByPondType[pondTypeId]?.length > 0) {
            const apiOperations = operationsByPondType[pondTypeId];

            // Convert API operations to JobType format
            const jobTypes: { type: JobType; items: JobExecution[] }[] = [];
            for (const operation of apiOperations) {
                // Use new field operationName, fallback to old if missing
                const opName = operation.operationName || operation.operationTypeName || '';
                const jobType = mapOperationTypeToJobType(opName);

                if (jobType) {
                    let items = pond?.id ? getPondJobItems(pond.id, jobType) : [];

                    // Override with API data for FEED
                    if (jobType === JOB_TYPES.FEED) {
                        items = apiFeedingJobs;
                    }

                    // Override with API data for MEASURE_SIZE
                    if (jobType === JOB_TYPES.MEASURE_SIZE) {
                        items = apiMeasureSizeJobs;
                    }

                    // Override with API data for SHRIMP_INSPECTION
                    if (jobType === JOB_TYPES.SHRIMP_INSPECTION) {
                        items = apiShrimpInspectionJobs;
                    }

                    // Override with API data for SIPHON
                    if (jobType === JOB_TYPES.SIPHON) {
                        items = apiSiphonJobs;
                    }

                    // Override with API data for ENVIRONMENT
                    if (jobType === JOB_TYPES.ENVIRONMENT) {
                        items = apiEnvJobs;
                    }
                    // Override with API data for TROUBLESHOOTING (Xử lý sự cố)
                    if (jobType === JOB_TYPES.TROUBLESHOOTING) {
                        items = apiIncidentJobs;
                    }

                    // Override with API data for CLEAN_POND
                    if (jobType === JOB_TYPES.CLEAN_POND) {
                        items = apiCleanRenovationJobs;
                    }

                    // Override with API data for SUN_DRY_POND
                    if (jobType === JOB_TYPES.SUN_DRY_POND) {
                        items = apiDryRenovationJobs;
                    }

                    // Override with API data for WATER_CHANGE
                    if (jobType === JOB_TYPES.WATER_CHANGE) {
                        items = apiWaterSupplyJobs;
                    }

                    if (jobType === JOB_TYPES.HARVEST) {
                        items = apiHarvestJobs;
                    }

                    jobTypes.push({
                        type: jobType,
                        items,
                    });
                }
            }

            const JOB_PRIORITY: Record<string, number> = {
                [JOB_TYPES.FEED]: 1,
                [JOB_TYPES.SHRIMP_INSPECTION]: 2,
                [JOB_TYPES.MEASURE_SIZE]: 3,
                [JOB_TYPES.ENVIRONMENT]: 4,
                [JOB_TYPES.WATER_TREATMENT]: 5,
                [JOB_TYPES.WATER_CHANGE]: 6,
                [JOB_TYPES.SIPHON]: 7,
                [JOB_TYPES.TROUBLESHOOTING]: 8,
                [JOB_TYPES.TRANSFER_POND]: 9,
                [JOB_TYPES.HARVEST]: 10,
                [JOB_TYPES.CLEAN_POND]: 11,
                [JOB_TYPES.SUN_DRY_POND]: 12,
            };
            return jobTypes.sort((a, b) => {
                const priorityA = JOB_PRIORITY[a.type] || 99;
                const priorityB = JOB_PRIORITY[b.type] || 99;
                return priorityA - priorityB;
            });
        }

        // No API data available - return empty array
        return [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pond?.type,
        pond?.id,
        getPondJobItems,
        operationsByPondType,
        feedJobs,
        shrimpInspectionJobs,
        measureSizeJobs,
        apiMeasureSizeJobs,
        apiShrimpInspectionJobs,
        apiSiphonJobs,
        apiEnvJobs,
        apiFeedingJobs,
        apiIncidentJobs,
        apiHarvestJobs,
        apiCleanRenovationJobs,
        apiDryRenovationJobs,
        apiWaterSupplyJobs,
        environmentJobs,
        waterTreatmentJobs,
        waterChangeJobs,
        siphonJobs,
        troubleshootingJobs,
        transferPondJobs,
        cleanPondJobs,
        sunDryJobs,
        harvestJobs,
    ]);

    return {
        jobs,
        apiMeasureSizeJobs,
    };
};
