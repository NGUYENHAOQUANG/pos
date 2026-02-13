import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useActiveCycle, useCyclesByPond } from '@/features/farm/hooks/useCycle';
import { JOB_TYPES, PondData, JobExecution } from '@/features/farm/types/farm.types';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { JobType } from '@/features/farm/components/pondwork/JobItem';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const usePondJobHandlers = (
    pond: PondData | undefined,
    setIsMeasureSizeModalVisible: (visible: boolean) => void,
    apiMeasureSizeJobs: JobExecution[]
) => {
    const navigation = useNavigation<NavigationProp>();

    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const updatePondJob = useFarmStore(state => state.updatePondJob);

    // Use hooks to get cycle data
    const activeCycle = useActiveCycle(pond?.id || '');
    const { data: cyclesData } = useCyclesByPond(pond?.id || '');
    const cycles = useMemo(() => cyclesData || [], [cyclesData]);

    const handleAddJobItem = useCallback(
        (type: JobType) => {
            if (!pond?.id) return;

            switch (type) {
                case JOB_TYPES.FEED:
                    navigation.navigate('FeedTheShrimp', { pondId: pond.id });
                    break;

                case JOB_TYPES.SHRIMP_INSPECTION:
                    navigation.navigate('ShrimpInspectionScreen', { pond });
                    break;

                case JOB_TYPES.MEASURE_SIZE:
                    navigation.navigate('MeasureShrimpSizeScreen', { pond });
                    break;

                case JOB_TYPES.ENVIRONMENT:
                    navigation.navigate('AddEnvironmentScreen', { pond });
                    break;

                case JOB_TYPES.SIPHON:
                    navigation.navigate('AddSiphonScreen', { pond });
                    break;

                case JOB_TYPES.WATER_TREATMENT:
                    navigation.navigate('AddWaterTreatmentScreen', { pond });
                    break;

                case JOB_TYPES.WATER_CHANGE:
                    navigation.navigate('WaterSupply', { pond });
                    break;

                case JOB_TYPES.TRANSFER_POND: {
                    // Get latest shrimp size from MEASURE_SIZE jobs
                    const measureSizeItems = apiMeasureSizeJobs;

                    // Check if there is no measure size data, show warning modal
                    if (measureSizeItems.length === 0) {
                        setIsMeasureSizeModalVisible(true);
                        return;
                    }

                    let latestShrimpSize: string | undefined;

                    // Sort by date (newest first), then by time (newest first)
                    const sorted = [...measureSizeItems].sort((a, b) => {
                        const dateA = a.date ? parseDate(a.date) : new Date(0);
                        const dateB = b.date ? parseDate(b.date) : new Date(0);

                        if (dateA.getTime() !== dateB.getTime()) {
                            return dateB.getTime() - dateA.getTime(); // Newest first
                        }

                        // If same date, sort by time (newest first)
                        const timeA = a.time || '00:00';
                        const timeB = b.time || '00:00';
                        const [hoursA, minutesA] = timeA.split(':').map(Number);
                        const [hoursB, minutesB] = timeB.split(':').map(Number);
                        const totalMinutesA = hoursA * 60 + minutesA;
                        const totalMinutesB = hoursB * 60 + minutesB;

                        return totalMinutesB - totalMinutesA; // Newest first
                    });

                    const latestItem = sorted[0];
                    const latestMeta = latestItem?.meta as { shrimpSize?: string } | undefined;
                    latestShrimpSize = latestMeta?.shrimpSize;

                    // Get cycle data for current pond
                    const cycleData =
                        activeCycle ||
                        cycles.find(cycle => cycle.receivingPonds?.includes(pond.id)) ||
                        cycles[0] ||
                        null;

                    navigation.navigate('AddTransferScreen', {
                        pond,
                        latestShrimpSize,
                        cycleData,
                    });
                    break;
                }

                case JOB_TYPES.HARVEST:
                    navigation.navigate('AddHarvestScreen', { pond });
                    break;

                case JOB_TYPES.CLEAN_POND:
                    navigation.navigate('HandleProblem', { pond, jobType: 'CLEAN_POND' });
                    break;

                case JOB_TYPES.SUN_DRY_POND:
                    navigation.navigate('HandleProblem', { pond, jobType: 'SUN_DRY_POND' });
                    break;

                case JOB_TYPES.TROUBLESHOOTING:
                    navigation.navigate('HandleProblem', {
                        pond,
                        jobType: 'TROUBLESHOOTING' as any,
                    });
                    break;

                default: {
                    const currentItems = getPondJobItems(pond.id, type);

                    // Calculate next index based on max existing label
                    let maxIndex = 0;
                    currentItems.forEach(item => {
                        const match = item.label.match(/Lần (\d+)/);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            if (index > maxIndex) maxIndex = index;
                        }
                    });
                    const nextIndex = maxIndex + 1;

                    const now = new Date();
                    const timeString = now.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });

                    const newItem: JobExecution = {
                        id: Date.now().toString(),
                        label: `Lần ${nextIndex}`,
                        time: timeString,
                        pondId: pond.id,
                    };

                    updatePondJob(pond.id, type, [...currentItems, newItem]);
                    break;
                }
            }
        },
        [
            pond,
            navigation,
            apiMeasureSizeJobs,
            setIsMeasureSizeModalVisible,
            activeCycle,
            cycles,
            getPondJobItems,
            updatePondJob,
        ]
    );

    const handleEditJobItem = useCallback(
        (type: JobType, item: JobExecution) => {
            if (!pond?.id) return;

            switch (type) {
                case JOB_TYPES.FEED:
                    navigation.navigate('EditFeeder', {
                        pondId: pond.id,
                        jobId: item.id,
                        itemToEdit: item,
                    });
                    break;

                case JOB_TYPES.SHRIMP_INSPECTION:
                    navigation.navigate('ShrimpInspectionScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.MEASURE_SIZE:
                    navigation.navigate('MeasureShrimpSizeScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.ENVIRONMENT:
                    navigation.navigate('AddEnvironmentScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.SIPHON:
                    navigation.navigate('AddSiphonScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.WATER_TREATMENT:
                    navigation.navigate('EditWaterTreatmentScreens', {
                        pondId: pond.id,
                        jobId: item.id,
                        itemToEdit: item,
                    });
                    break;

                case JOB_TYPES.WATER_CHANGE:
                    navigation.navigate('WaterSupply', { pond, item });
                    break;

                case JOB_TYPES.TRANSFER_POND:
                    navigation.navigate('AddTransferScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.HARVEST:
                    navigation.navigate('AddHarvestScreen', { pond, itemToEdit: item });
                    break;

                case JOB_TYPES.CLEAN_POND:
                    navigation.navigate('HandleProblem', { pond, item, jobType: 'CLEAN_POND' });
                    break;

                case JOB_TYPES.SUN_DRY_POND:
                    navigation.navigate('HandleProblem', { pond, item, jobType: 'SUN_DRY_POND' });
                    break;

                case JOB_TYPES.TROUBLESHOOTING:
                    navigation.navigate('HandleProblem', {
                        pond,
                        item,
                        jobType: 'TROUBLESHOOTING' as any,
                    });
                    break;

                default: {
                    const itemToEdit = item;
                    const currentItems = getPondJobItems(pond.id, type);
                    const newItems = currentItems.filter(i => i.id !== itemToEdit.id);
                    updatePondJob(pond.id, type, newItems);
                    break;
                }
            }
        },
        [pond, navigation, getPondJobItems, updatePondJob]
    );

    const handleJobPress = useCallback(
        (type: JobType) => {
            if (!pond?.id) return;
            switch (type) {
                case JOB_TYPES.FEED:
                    navigation.navigate('FeedingLog', { pondId: pond.id });
                    break;
                case JOB_TYPES.WATER_TREATMENT:
                    navigation.navigate('WaterTreatmentLog', { pond });
                    break;
                case JOB_TYPES.SHRIMP_INSPECTION:
                    navigation.navigate('PondworkLogScreen', { pond });
                    break;
                case JOB_TYPES.MEASURE_SIZE:
                    navigation.navigate('MeasureShrimpSizeLogScreen', { pond });
                    break;
                case JOB_TYPES.ENVIRONMENT:
                    navigation.navigate('EnvironmentLogScreen', { pond });
                    break;
                case JOB_TYPES.SIPHON:
                    navigation.navigate('SiphonLog', { pond });
                    break;
                case JOB_TYPES.HARVEST:
                    navigation.navigate('HarvestLog', { pond });
                    break;
                case JOB_TYPES.TRANSFER_POND:
                    navigation.navigate('TransferLog', { pond });
                    break;
                case JOB_TYPES.WATER_CHANGE:
                    navigation.navigate('WaterSupplyLog', { pond });
                    break;
                case JOB_TYPES.CLEAN_POND:
                    navigation.navigate('HandleProblemLog', { pond, jobType: 'CLEAN_POND' });
                    break;
                case JOB_TYPES.SUN_DRY_POND:
                    navigation.navigate('SunDryPondLog', { pond });
                    break;
                case JOB_TYPES.TROUBLESHOOTING:
                    navigation.navigate('HandleProblemLog', {
                        pond,
                        jobType: 'TROUBLESHOOTING' as any,
                    });
                    break;
            }
        },
        [pond, navigation]
    );

    return {
        handleAddJobItem,
        handleEditJobItem,
        handleJobPress,
    };
};
