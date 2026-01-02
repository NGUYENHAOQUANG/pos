import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { PondCycleEmptyState } from '@/features/farm/components/EmptyStateCard';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobListCard } from '@/features/farm/components/pondwork/JobListCard';
import { useFarm } from '@/features/farm/context/FarmContext';
import { JobExecution, CycleData } from '@/features/farm/types/farm.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import Toast from 'react-native-toast-message';
import { CycleCard } from '@/features/farm/components/pond/CycleCard';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { WorkLogScreens } from '@/features/farm/screens/worklog/WorkLogScreens';

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
};

// Common jobs - dùng cho cả ao vèo và ao nuôi
const COMMON_JOBS_TEMPLATE: { type: JobType; items: never[] }[] = [
    { type: JOB_TYPES.FEED, items: [] },
    { type: JOB_TYPES.SHRIMP_INSPECTION, items: [] },
    { type: JOB_TYPES.MEASURE_SIZE, items: [] },
    { type: JOB_TYPES.ENVIRONMENT, items: [] },
    { type: JOB_TYPES.WATER_TREATMENT, items: [] },
    { type: JOB_TYPES.WATER_CHANGE, items: [] },
    { type: JOB_TYPES.SIPHON, items: [] },
    { type: JOB_TYPES.CLEAN_POND, items: [] },
    { type: JOB_TYPES.SUN_DRY_POND, items: [] },
];

const NURSERY_POND_JOBS_TEMPLATE: { type: JobType; items: never[] }[] = [
    { type: JOB_TYPES.TRANSFER_POND, items: [] },
];

const CULTIVATION_POND_JOBS_TEMPLATE: { type: JobType; items: never[] }[] = [
    { type: JOB_TYPES.HARVEST, items: [] },
];

const PREPARATION_JOBS_TEMPLATE: { type: JobType; items: never[] }[] = [
    { type: JOB_TYPES.ENVIRONMENT, items: [] },
    { type: JOB_TYPES.WATER_TREATMENT, items: [] },
    { type: JOB_TYPES.WATER_CHANGE, items: [] },
    { type: JOB_TYPES.CLEAN_POND, items: [] },
    { type: JOB_TYPES.SUN_DRY_POND, items: [] },
];

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondDetail'>;

export const ShrimpFarmScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const [selectedTab, setSelectedTab] = useState<string>('work');
    const { setTabBarVisible } = useTabBarVisibility();

    const { getPondJobItems, updatePondJob, activeCycles, breedOptions, getCyclesByPondId } =
        useFarm();

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
    }, [pond?.id, getCyclesByPondId]);

    // Ưu tiên chu kỳ từ activeCycles, nếu không có thì dùng từ cycles
    const currentCycle: CycleData | null = useMemo(() => {
        const currentCycleData = pond?.id ? activeCycles[pond.id] : null;
        return currentCycleData || foundCycle;
    }, [pond?.id, activeCycles, foundCycle]);

    const [hasCycleBefore, setHasCycleBefore] = useState(!!currentCycle);

    useEffect(() => {
        // TRƯỜNG HỢP 1: Tạo mới thành công (Từ không có -> Có)
        if (!hasCycleBefore && currentCycle) {
            Toast.show({
                type: 'success',
                text1: 'Đã tạo chu kỳ nuôi thành công',
                position: 'top',
                topOffset: 60,
            });
            setHasCycleBefore(true);
        }
        // TRƯỜNG HỢP 2: Xóa thành công (Từ đang có -> Mất tiêu)
        else if (hasCycleBefore && !currentCycle) {
            Toast.show({
                type: 'success',
                text1: 'Đã xóa chu kỳ nuôi thành công',
                position: 'top',
                topOffset: 60,
            });
            setHasCycleBefore(false);
        }
    }, [currentCycle, hasCycleBefore]);

    // Chọn template dựa vào loại ao và tạo jobs
    const jobs = useMemo(() => {
        let jobTemplate: { type: JobType; items: never[] }[];

        if (!currentCycle) {
            jobTemplate = PREPARATION_JOBS_TEMPLATE;
        } else if (!pond?.type) {
            jobTemplate = COMMON_JOBS_TEMPLATE;
        } else {
            switch (pond.type) {
                case 'Ao vèo':
                    jobTemplate = [...COMMON_JOBS_TEMPLATE, ...NURSERY_POND_JOBS_TEMPLATE];
                    break;
                case 'Ao nuôi':
                    jobTemplate = [...COMMON_JOBS_TEMPLATE, ...CULTIVATION_POND_JOBS_TEMPLATE];
                    break;
                default:
                    jobTemplate = COMMON_JOBS_TEMPLATE;
            }
        }

        return jobTemplate.map(template => ({
            ...template,
            items: pond?.id ? getPondJobItems(pond.id, template.type) : [],
        }));
    }, [pond?.type, pond?.id, getPondJobItems, currentCycle]);

    useEffect(() => {
        setTabBarVisible(false);
        return () => {
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    const calculateDOC = (startDateString: string | null | undefined) => {
        if (!startDateString) return 0;
        // Parse date: if string contains "/", it's dd/mm/yyyy format, use parseDate
        // Otherwise, it's ISO string, use new Date()
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
            navigation.navigate('CreateCycle', { pondId: pond.id });
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
            const measureSizeItems = getPondJobItems(pond.id, 'MEASURE_SIZE');
            let latestShrimpSize: string | undefined = undefined;

            if (measureSizeItems.length > 0) {
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
            }

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

        const itemToEdit = item; // Alias for compatibility with below code if needed

        // For other job types, keep the delete behavior (or implement edit later)
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
    };

    // Logic: If "Ao sẵn sàng" has a cycle, display as "Ao vèo"
    const headerDisplayType = pond?.type === 'Ao sẵn sàng' && currentCycle ? 'Ao vèo' : undefined;

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
                >
                    {selectedTab === 'work' ? (
                        <>
                            {/* HIỂN THỊ CYCLE CARD NẾU CÓ DỮ LIỆU */}
                            {currentCycle ? (
                                <View style={styles.cycleCardWrapper}>
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
                                </View>
                            ) : (
                                <PondCycleEmptyState />
                            )}

                            <JobListCard
                                jobs={jobs}
                                onPressJob={handleJobPress}
                                onPressAddJob={handleAddJobItem}
                                onEditJobItem={handleEditJobItem}
                            />
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

            {/* CHỈ HIỆN NÚT KHI CHƯA CÓ CHU KỲ */}
            {selectedTab === 'work' && !currentCycle && (
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
    },
});
