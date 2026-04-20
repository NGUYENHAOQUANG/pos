import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { PondData, JOB_TYPES, JobExecution } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { useScaleStore } from '@/features/farm/store/scaleStore';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export type JobHandler = () => void;
export type JobEditHandler = (item: JobExecution) => void;
export type JobLogHandler = () => void;

interface UsePondJobNavigateHandlersParams {
    pond?: PondData;
    cycleId?: string;
    handleTransferPond?: JobHandler;
    handleHarvest?: JobHandler;
}

/**
 * Tạo sẵn map handler điều hướng theo JobType cho màn hồ tôm.
 * Giúp ShrimpFarmScreens (và màn khác) dùng lại logic điều hướng một cách gọn gàng.
 */
export const usePondJobNavigateHandlers = ({
    pond,
    cycleId,
    handleTransferPond,
    handleHarvest,
}: UsePondJobNavigateHandlersParams): Partial<Record<JobType, JobHandler>> => {
    const navigation = useNavigation<NavigationProp>();

    return useMemo(
        () => ({
            [JOB_TYPES.FEED]: () => {
                if (!pond?.id) return;
                navigation.navigate('FeedingFormScreen', { pondId: pond.id });
            },

            [JOB_TYPES.SHRIMP_INSPECTION]: () => {
                if (!pond?.id || !pond.zoneId) return;
                navigation.navigate('ShrimpHealthScreen', {
                    pondId: pond.id,
                    zoneId: pond.zoneId.toString(),
                });
            },

            [JOB_TYPES.MEASURE_SIZE]: () => {
                if (!pond?.id) return;
                navigation.navigate('MeasureShrimpSizeScreen', { pondId: pond.id });
            },

            [JOB_TYPES.ENVIRONMENT]: () => {
                if (!pond) return;
                navigation.navigate('AddEnvironmentScreen', { pondId: pond.id });
            },

            [JOB_TYPES.SIPHON]: () => {
                if (!pond) return;
                navigation.navigate('AddSiphonScreen', { pond });
            },

            [JOB_TYPES.WATER_TREATMENT]: () => {
                if (!pond?.id) return;
                navigation.navigate('WaterTreatmentScreen', { pondId: pond.id });
            },

            [JOB_TYPES.WATER_CHANGE]: () => {
                if (!pond) return;
                navigation.navigate('WaterChangeFormScreen', { pond });
            },

            [JOB_TYPES.TRANSFER_POND]: () => {
                if (!handleTransferPond) return;
                handleTransferPond();
            },

            [JOB_TYPES.HARVEST]: () => {
                const activeCycleId = cycleId || pond?.cyclePond?.cycleId;
                if (!pond?.id || !activeCycleId) return;

                useScaleStore.getState().clearManualRecords();

                if (handleHarvest) {
                    handleHarvest();
                } else {
                    navigation.navigate('HarvestFormScreen', {
                        pondId: pond.id,
                        cycleId: activeCycleId,
                    });
                }
            },

            [JOB_TYPES.CLEAN_POND]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', { pondId: pond.id, jobType: 'CLEAN_POND' });
            },

            [JOB_TYPES.SUN_DRY_POND]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', { pondId: pond.id, jobType: 'SUN_DRY_POND' });
            },

            [JOB_TYPES.TROUBLESHOOTING]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', {
                    pondId: pond.id,
                    jobType: 'TROUBLESHOOTING',
                });
            },
        }),
        [navigation, pond, cycleId, handleTransferPond, handleHarvest]
    );
};

interface UsePondJobEditHandlersParams {
    pond?: PondData;
    cycleId?: string;
}

/**
 * Map handler chỉnh sửa job theo JobType.
 */
export const usePondJobEditHandlers = ({
    pond,
    cycleId,
}: UsePondJobEditHandlersParams): Partial<Record<JobType, JobEditHandler>> => {
    const navigation = useNavigation<NavigationProp>();

    return useMemo(
        () => ({
            [JOB_TYPES.FEED]: item => {
                if (!pond?.id) return;
                navigation.navigate('FeedingFormScreen', {
                    pondId: pond.id,
                    jobId: item.id,
                    itemToEdit: item,
                });
            },

            [JOB_TYPES.SHRIMP_INSPECTION]: item => {
                if (!pond?.id || !pond.zoneId) return;
                navigation.navigate('ShrimpHealthScreen', {
                    pondId: pond.id,
                    zoneId: pond.zoneId,
                    shrimpHealthId: item.id,
                });
            },

            [JOB_TYPES.MEASURE_SIZE]: item => {
                if (!pond?.id) return;
                navigation.navigate('MeasureShrimpSizeScreen', {
                    pondId: pond.id,
                    measureShrimpSizeId: item.id,
                });
            },

            [JOB_TYPES.ENVIRONMENT]: item => {
                if (!pond) return;
                navigation.navigate('AddEnvironmentScreen', {
                    pondId: pond.id,
                    environmentId: item.id,
                });
            },

            [JOB_TYPES.SIPHON]: item => {
                if (!pond) return;
                navigation.navigate('AddSiphonScreen', { pond, siphonId: item.id });
            },

            [JOB_TYPES.WATER_TREATMENT]: item => {
                if (!pond?.id) return;
                navigation.navigate('WaterTreatmentScreen', {
                    pondId: pond.id,
                    jobId: item.id,
                });
            },

            [JOB_TYPES.WATER_CHANGE]: item => {
                if (!pond) return;
                navigation.navigate('WaterChangeFormScreen', { pond, item });
            },

            [JOB_TYPES.TRANSFER_POND]: _item => {
                // Stock transfer does not support editing
            },

            [JOB_TYPES.HARVEST]: item => {
                const activeCycleId = cycleId || pond?.cyclePond?.cycleId;
                if (!pond?.id || !activeCycleId) return;

                useScaleStore.getState().clearManualRecords();

                navigation.navigate('HarvestFormScreen', {
                    pondId: pond.id,
                    cycleId: activeCycleId,
                    harvestRecordId: item.id,
                });
            },

            [JOB_TYPES.CLEAN_POND]: item => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', {
                    pondId: pond.id,
                    item,
                    jobType: 'CLEAN_POND',
                });
            },

            [JOB_TYPES.SUN_DRY_POND]: item => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', {
                    pondId: pond.id,
                    item,
                    jobType: 'SUN_DRY_POND',
                });
            },

            [JOB_TYPES.TROUBLESHOOTING]: item => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblem', {
                    pondId: pond.id,
                    item,
                    jobType: 'TROUBLESHOOTING',
                });
            },
        }),
        [navigation, pond, cycleId]
    );
};

interface UsePondJobLogHandlersParams {
    pond?: PondData;
}

/**
 * Map handler xem nhật ký job theo JobType.
 */
export const usePondJobLogHandlers = ({
    pond,
}: UsePondJobLogHandlersParams): Partial<Record<JobType, JobLogHandler>> => {
    const navigation = useNavigation<NavigationProp>();

    return useMemo(
        () => ({
            [JOB_TYPES.FEED]: () => {
                if (!pond?.id) return;
                navigation.navigate('FeedingLog', { pondId: pond.id });
            },

            [JOB_TYPES.WATER_TREATMENT]: () => {
                if (!pond?.id) return;
                navigation.navigate('WaterTreatmentLog', { pondId: pond.id, pond });
            },

            [JOB_TYPES.SHRIMP_INSPECTION]: () => {
                if (!pond?.id || !pond.zoneId) return;
                navigation.navigate('PondworkLogScreen', {
                    pondId: pond.id,
                    zoneId: pond.zoneId,
                });
            },

            [JOB_TYPES.MEASURE_SIZE]: () => {
                if (!pond?.id) return;
                navigation.navigate('MeasureShrimpSizeLogScreen', { pondId: pond.id });
            },

            [JOB_TYPES.ENVIRONMENT]: () => {
                if (!pond) return;
                navigation.navigate('EnvironmentLogScreen', { pond });
            },

            [JOB_TYPES.SIPHON]: () => {
                if (!pond) return;
                navigation.navigate('SiphonLog', { pond });
            },

            [JOB_TYPES.HARVEST]: () => {
                if (!pond) return;
                navigation.navigate('HarvestLog', { pond });
            },

            [JOB_TYPES.TRANSFER_POND]: () => {
                if (!pond) return;
                navigation.navigate('TransferLog', { pond });
            },

            [JOB_TYPES.WATER_CHANGE]: () => {
                if (!pond) return;
                navigation.navigate('WaterSupplyLog', { pond });
            },

            [JOB_TYPES.CLEAN_POND]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblemLog', { pondId: pond.id, jobType: 'CLEAN_POND' });
            },

            [JOB_TYPES.SUN_DRY_POND]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblemLog', {
                    pondId: pond.id,
                    jobType: 'SUN_DRY_POND',
                });
            },

            [JOB_TYPES.TROUBLESHOOTING]: () => {
                if (!pond?.id) return;
                navigation.navigate('HandleProblemLog', {
                    pondId: pond.id,
                    jobType: 'TROUBLESHOOTING',
                });
            },
        }),
        [navigation, pond]
    );
};
