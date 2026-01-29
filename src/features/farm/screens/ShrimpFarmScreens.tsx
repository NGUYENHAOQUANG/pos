import React, { useState, useEffect, useMemo } from 'react';
import { useSizeMeasurementsAsJobs } from '@/features/farm/hooks/useSizeMeasurement';
import { useSiphonRecordsAsJobs } from '@/features/farm/hooks/useSiphonRecords';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { PondJobSkeleton } from '@/features/farm/components/skeleton/PondJobSkeleton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { PondCycleEmptyState } from '@/features/farm/components/EmptyStateCard';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobListCard } from '@/features/farm/components/pondwork/JobListCard';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { JobExecution, CycleData, POND_TYPES } from '@/features/farm/types/farm.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { CycleCard } from '@/features/farm/components/pond/CycleCard';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { WorkLogScreens } from '@/features/farm/screens/worklog/WorkLogScreens';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { useShrimpHealthCheckData } from '@/features/farm/hooks/useShrimpHealthCheckData';

const JOB_TYPES = {
    FEED: 'FEED' as const,
    SHRIMP_INSPECTION: 'SHRIMP_INSPECTION' as const,
    MEASURE_SIZE: 'MEASURE_SIZE' as const,
    ENVIRONMENT: 'ENVIRONMENT' as const,
    WATER_TREATMENT: 'WATER_TREATMENT' as const,
    WATER_CHANGE: 'WATER_CHANGE' as const,
    SIPHON: 'SIPHON' as const,
    TRANSFER_POND: 'TRANSFER_POND' as const,
    CLEAN_POND: 'CLEAN_POND' as const,
    SUN_DRY_POND: 'SUN_DRY_POND' as const,
    HARVEST: 'HARVEST' as const,
    TROUBLESHOOTING: 'TROUBLESHOOTING' as const,
};

// JOB_TYPES constant - used for mapping API operation types to job types
// Note: Hardcoded job templates have been removed. Jobs are now fetched from API.

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondDetail'>;

export const ShrimpFarmScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond: pondFromParams } = route.params || {};

    const [selectedTab, setSelectedTab] = useState<string>('work');
    const [isMeasureSizeModalVisible, setIsMeasureSizeModalVisible] = useState(false);
    const { setTabBarVisible } = useTabBarVisibility();

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const activeCycles = useFarmStore(state => state.activeCycles);
    const breedOptions = useFarmStore(state => state.breedOptions);
    const getCyclesByPondId = useFarmStore(state => state.getCyclesByPondId);
    const getPondById = useFarmStore(state => state.getPondById);
    const ponds = useFarmStore(state => state.ponds);
    const cycles = useFarmStore(state => state.cycles);
    const operationsByPondTypeRaw = useFarmStore(state => state.operationsByPondType);
    const operationsByPondType = useMemo(
        () => operationsByPondTypeRaw || {},
        [operationsByPondTypeRaw]
    );
    const fetchMasterData = useFarmStore(state => state.fetchMasterData);
    const isLoadingMasterData = useFarmStore(state => state.isLoadingMasterData);

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

    // Fallback loading state if fetchMasterData is triggered but not reflected in store yet
    const [localLoading, setLocalLoading] = useState(false);

    // Fetch master data (operation types) if not loaded yet
    useEffect(() => {
        if (Object.keys(operationsByPondType).length === 0) {
            setLocalLoading(true);
            fetchMasterData()
                .then(() => setLocalLoading(false))
                .catch(() => setLocalLoading(false));
        }
    }, [operationsByPondType, fetchMasterData]);

    const isLoading = isLoadingMasterData || localLoading;

    // Get fresh pond data from context instead of stale params
    const pond = useMemo(() => {
        if (!pondFromParams?.id) return pondFromParams;
        const storePond = getPondById(pondFromParams.id);

        // If store pond exists but has no type/invalid type, while params pond has it,
        // we should prioritize params pond or merge them via fallback
        if (storePond) {
            const hasValidStoreType =
                storePond.type && (typeof storePond.type !== 'string' || storePond.type.length > 0);
            if (!hasValidStoreType && pondFromParams.type) {
                // If store is missing type data but params has it, use store pond but patch the type from params
                return { ...storePond, type: pondFromParams.type };
            }
            return storePond;
        }

        return pondFromParams;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pondFromParams, getPondById, ponds]);

    // Ensure shrimp inspection jobs are synced from API for this pond
    useShrimpHealthCheckData(pond?.id);

    // Tìm chu kỳ từ context dựa vào ID ao (ưu tiên receivingPonds, sau đó sourcePonds)
    const foundCycle = useMemo(() => {
        if (!pond?.id) return null;
        const cyclesForPond = getCyclesByPondId(pond.id);
        if (cyclesForPond.length === 0) return null;

        // Tìm chu kỳ có ao này trong receivingPonds trước (ao nhận = ao chính)
        const cycleInReceiving = cyclesForPond.find(cycle =>
            cycle.receivingPonds?.includes(pond.id)
        );
        if (cycleInReceiving) return cycleInReceiving;

        // Nếu không có, lấy chu kỳ đầu tiên (ao nguồn)
        return cyclesForPond[0] || null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pond?.id, getCyclesByPondId, cycles]);

    // Ưu tiên chu kỳ từ activeCycles, nếu không có thì dùng từ cycles
    const currentCycle: CycleData | null = useMemo(() => {
        const currentCycleData = pond?.id ? activeCycles[pond.id] : null;
        return currentCycleData || foundCycle;
    }, [pond?.id, activeCycles, foundCycle]);
    // Fetch size measurements from API
    const { jobs: apiMeasureSizeJobs } = useSizeMeasurementsAsJobs(pond?.id || '');
    // Fetch siphon records from API
    const { jobs: apiSiphonJobs } = useSiphonRecordsAsJobs(pond?.id || '');

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

                    // Override with API data for MEASURE_SIZE
                    if (jobType === JOB_TYPES.MEASURE_SIZE) {
                        items = apiMeasureSizeJobs;
                    }

                    // Override with API data for SIPHON
                    if (jobType === JOB_TYPES.SIPHON) {
                        items = apiSiphonJobs;
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
        currentCycle,
        operationsByPondType,
        // Add all job maps as dependencies
        feedJobs,
        shrimpInspectionJobs,
        measureSizeJobs,
        apiMeasureSizeJobs,
        apiSiphonJobs,
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

    useEffect(() => {
        setTabBarVisible(false);
        return () => {
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    const calculateDOC = (startDateString: string | null | undefined) => {
        if (!startDateString) return 0;
        const start =
            typeof startDateString === 'string' && startDateString.includes('/')
                ? parseDate(startDateString)
                : new Date(startDateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    const handleStartCycle = () => {
        if (pond?.id) {
            navigation.navigate('CreateCycle', {
                pondId: pond.id,
                zoneId: pond.zoneId?.toString(), // Pass zoneId for season fetching
            });
        }
    };

    const handleAddJobItem = (type: JobType) => {
        if (!pond?.id) return;

        if (type === JOB_TYPES.FEED) {
            navigation.navigate('FeedTheShrimp', { pondId: pond.id });
            return;
        }

        if (type === JOB_TYPES.SHRIMP_INSPECTION) {
            navigation.navigate('ShrimpInspectionScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.MEASURE_SIZE) {
            navigation.navigate('MeasureShrimpSizeScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.ENVIRONMENT) {
            navigation.navigate('AddEnvironmentScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.SIPHON) {
            navigation.navigate('AddSiphonScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.WATER_TREATMENT) {
            navigation.navigate('AddWaterTreatmentScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.WATER_CHANGE) {
            navigation.navigate('WaterSupply', { pond });
            return;
        }

        if (type === JOB_TYPES.TRANSFER_POND) {
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
            const currentCycleData = pond?.id ? activeCycles[pond.id] : null;
            const cyclesForPond = getCyclesByPondId(pond.id);
            const cycleData =
                currentCycleData ||
                cyclesForPond.find(cycle => cycle.receivingPonds?.includes(pond.id)) ||
                cyclesForPond[0] ||
                null;

            navigation.navigate('AddTransferScreen', {
                pond,
                latestShrimpSize,
                cycleData,
            });
            return;
        }

        if (type === JOB_TYPES.HARVEST) {
            navigation.navigate('AddHarvestScreen', { pond });
            return;
        }

        if (type === JOB_TYPES.CLEAN_POND) {
            navigation.navigate('HandleProblem', { pond, jobType: 'CLEAN_POND' });
            return;
        }

        if (type === JOB_TYPES.SUN_DRY_POND) {
            navigation.navigate('HandleProblem', { pond, jobType: 'SUN_DRY_POND' });
            return;
        }

        if (type === JOB_TYPES.TROUBLESHOOTING) {
            navigation.navigate('HandleProblem', { pond, jobType: 'TROUBLESHOOTING' as any });
            return;
        }

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
        const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const newItem: JobExecution = {
            id: Date.now().toString(),
            label: `Lần ${nextIndex}`,
            time: timeString,
            pondId: pond.id,
        };

        updatePondJob(pond.id, type, [...currentItems, newItem]);
    };

    const handleEditJobItem = (type: JobType, item: JobExecution) => {
        if (!pond?.id) return;

        if (type === JOB_TYPES.FEED) {
            navigation.navigate('EditFeeder', { pondId: pond.id, jobId: item.id });
            return;
        }

        if (type === JOB_TYPES.SHRIMP_INSPECTION) {
            navigation.navigate('ShrimpInspectionScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.MEASURE_SIZE) {
            navigation.navigate('MeasureShrimpSizeScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.ENVIRONMENT) {
            navigation.navigate('AddEnvironmentScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.SIPHON) {
            navigation.navigate('AddSiphonScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.WATER_TREATMENT) {
            navigation.navigate('EditWaterTreatmentScreens', { pondId: pond.id, jobId: item.id });
            return;
        }

        if (type === JOB_TYPES.WATER_CHANGE) {
            navigation.navigate('WaterSupply', { pond, item });
            return;
        }

        if (type === JOB_TYPES.TRANSFER_POND) {
            navigation.navigate('AddTransferScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.HARVEST) {
            navigation.navigate('AddHarvestScreen', { pond, itemToEdit: item });
            return;
        }

        if (type === JOB_TYPES.CLEAN_POND) {
            navigation.navigate('HandleProblem', { pond, item, jobType: 'CLEAN_POND' });
            return;
        }

        if (type === JOB_TYPES.SUN_DRY_POND) {
            navigation.navigate('HandleProblem', { pond, item, jobType: 'SUN_DRY_POND' });
            return;
        }

        if (type === JOB_TYPES.TROUBLESHOOTING) {
            navigation.navigate('HandleProblem', { pond, item, jobType: 'TROUBLESHOOTING' as any });
            return;
        }

        const itemToEdit = item;
        const currentItems = getPondJobItems(pond.id, type);
        const newItems = currentItems.filter(i => i.id !== itemToEdit.id);
        updatePondJob(pond.id, type, newItems);
    };

    const handleJobPress = (type: JobType) => {
        if (type === JOB_TYPES.FEED && pond?.id) {
            navigation.navigate('FeedingLog', { pondId: pond.id });
            return;
        }
        if (type === JOB_TYPES.WATER_TREATMENT && pond) {
            navigation.navigate('WaterTreatmentLog', { pond });
            return;
        }
        if (type === JOB_TYPES.SHRIMP_INSPECTION && pond) {
            navigation.navigate('PondworkLogScreen', { pond });
            return;
        }
        if (type === JOB_TYPES.MEASURE_SIZE && pond) {
            navigation.navigate('MeasureShrimpSizeLogScreen', { pond });
            return;
        }
        if (type === JOB_TYPES.ENVIRONMENT && pond) {
            navigation.navigate('EnvironmentLogScreen', { pond });
            return;
        }
        if (type === JOB_TYPES.SIPHON && pond) {
            navigation.navigate('SiphonLog', { pond });
            return;
        }
        if (type === JOB_TYPES.HARVEST && pond) {
            navigation.navigate('HarvestLog', { pond });
            return;
        }

        if (type === JOB_TYPES.TRANSFER_POND && pond) {
            navigation.navigate('TransferLog', { pond });
            return;
        }

        if (type === JOB_TYPES.WATER_CHANGE && pond) {
            navigation.navigate('WaterSupplyLog', { pond });
            return;
        }

        if (type === JOB_TYPES.CLEAN_POND && pond) {
            navigation.navigate('HandleProblemLog', { pond, jobType: 'CLEAN_POND' });
            return;
        }

        if (type === JOB_TYPES.SUN_DRY_POND && pond) {
            navigation.navigate('SunDryPondLog', { pond });
            return;
        }

        if (type === JOB_TYPES.TROUBLESHOOTING && pond) {
            navigation.navigate('HandleProblemLog', { pond, jobType: 'TROUBLESHOOTING' as any });
            return;
        }
    };

    const [refreshing, setRefreshing] = useState(false);
    // Logic: If "Ao sẵn sàng" has a cycle, display as "Ao vèo" -> REMOVED
    const headerDisplayType = undefined;

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchMasterData();
        } catch (error) {
            console.error('Refresh master data failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchMasterData]);

    return (
        <View style={styles.container}>
            <HeadingFarm
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                tabType="pond-detail"
                fullWidth
                pond={pond}
                displayPondType={headerDisplayType as any}
                onBack={() => navigation.goBack()}
                menuOptions={[
                    {
                        value: 'Thông tin ao',
                        onMenuOptionPress: () => navigation.navigate('PondInfo', { pond }),
                    },
                ]}
            />

            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['black']}
                        />
                    }
                >
                    {selectedTab === 'work' ? (
                        <>
                            {/* HIỂN THỊ CYCLE CARD NẾU CÓ DỮ LIỆU */}
                            {currentCycle ? (
                                <View style={styles.cycleCardWrapper}>
                                    {/* Main cycle card */}
                                    <CycleCard
                                        cycleName={currentCycle.cycleName || 'Chưa đặt tên'}
                                        startDate={currentCycle?.stockingDate ?? ''}
                                        doc={calculateDOC(currentCycle?.stockingDate ?? '')}
                                        stockingQuantity={currentCycle?.stockingQuantity || 0}
                                        breed={
                                            breedOptions.find(
                                                b => b.value === currentCycle.breedSource
                                            )?.label || 'N/A'
                                        }
                                        // Cho phép bấm vào thẻ để sửa
                                        onPress={() =>
                                            navigation.navigate('CycleDetail', {
                                                pondId: pond.id,
                                                cycleData: currentCycle,
                                            })
                                        }
                                    />

                                    {/* Transferred cycle card - show if pond received shrimp from nursery */}
                                    {currentCycle.transferInfo && (
                                        <CycleCard
                                            cycleName={
                                                currentCycle.transferInfo.originalCycle.cycleName ||
                                                'Chu kỳ ao vèo'
                                            }
                                            startDate={
                                                currentCycle.transferInfo.originalCycle.stockingDate
                                            }
                                            endDate={currentCycle.transferInfo.transferDate}
                                            doc={currentCycle.transferInfo.originalCycle.doc || 0}
                                            stockingQuantity={
                                                currentCycle.transferInfo.originalCycle
                                                    .stockingQuantity || 0
                                            }
                                            breed={
                                                breedOptions.find(
                                                    b =>
                                                        b.value ===
                                                        currentCycle.transferInfo?.originalCycle
                                                            .breedSource
                                                )?.label || 'N/A'
                                            }
                                            status="Hoàn thành"
                                            onPress={() =>
                                                navigation.navigate('CycleDetail', {
                                                    pondId: pond.id,
                                                    cycleData: currentCycle,
                                                })
                                            }
                                        />
                                    )}
                                </View>
                            ) : (
                                <PondCycleEmptyState />
                            )}

                            {isLoading ? (
                                <PondJobSkeleton />
                            ) : (
                                <JobListCard
                                    jobs={jobs}
                                    onPressJob={handleJobPress}
                                    onPressAddJob={handleAddJobItem}
                                    onEditJobItem={handleEditJobItem}
                                />
                            )}
                        </>
                    ) : selectedTab === 'log' ? (
                        <WorkLogScreens
                            pond={pond}
                            onEditJobItem={handleEditJobItem}
                            availableJobTypes={jobs.map(j => j.type)}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderText}>
                                Nhật ký công việc chưa có dữ liệu
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* CHỈ HIỆN NÚT KHI CHƯA CÓ CHU KỲ.
                User yêu cầu "Ao sẵn sàng" KHÔNG có bắt đầu chu kỳ nuôi.
            */}
            {selectedTab === 'work' &&
                !currentCycle &&
                (typeof pond?.type === 'string' ? pond.type : pond?.type?.name) ===
                    POND_TYPES.NURSERY && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStartCycle}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="add"
                                size={20}
                                color={colors.white}
                                style={styles.startIcon}
                            />
                            <Text style={styles.startButtonText}>Bắt đầu chu kỳ nuôi</Text>
                        </TouchableOpacity>
                    </View>
                )}

            {/* Modal cảnh báo cần đo kích thước tôm trước khi sang ao */}
            <ConfirmationModal
                visible={isMeasureSizeModalVisible}
                type="measure_size_required"
                onCancel={() => setIsMeasureSizeModalVisible(false)}
                onConfirm={() => {
                    setIsMeasureSizeModalVisible(false);
                    navigation.navigate('MeasureShrimpSizeScreen', { pond });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Space for footer
        flexGrow: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: 32,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    startButton: {
        width: '100%',
        height: 40,
        backgroundColor: colors.primary,
        borderRadius: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startIcon: {
        marginRight: spacing.xs,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.white,
        lineHeight: 24,
    },
    placeholderContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    placeholderText: {
        color: colors.text,
    },

    cycleCardWrapper: {
        marginTop: spacing.sm,
        marginBottom: spacing.sm, // Khoảng hở nhỏ so với danh sách công việc bên dưới
        gap: 8, // 8px spacing between cycle cards
    },
});
