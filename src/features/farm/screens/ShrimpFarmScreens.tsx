import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePondJobHandlers } from '@/features/farm/hooks/usePondJobHandlers';
import { useAllPondJobs } from '@/features/farm/hooks/useAllPondJobs';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { PondJobSkeleton } from '@/features/farm/components/skeleton/PondJobSkeleton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { PondCycleEmptyState } from '@/features/farm/components/EmptyStateCard';
import { JobListCard } from '@/features/farm/components/pondwork/JobListCard';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { CycleData, POND_TYPES } from '@/features/farm/types/farm.types';
import { useCyclesByPond } from '@/features/farm/hooks/useCycle.ts';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { CycleCard } from '@/features/farm/components/pond/CycleCard';
import { parseDate, formatDate } from '@/features/farm/utils/dateUtils';
import { WorkLogScreens } from '@/features/farm/screens/worklog/WorkLogScreens';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { useQuery } from '@tanstack/react-query';

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

    const { jobs, apiMeasureSizeJobs } = useAllPondJobs(pond);
    // 1. Get Zone ID
    const effectiveZoneId = pond?.zoneId?.toString();

    // 2. Fetch Warehouses for this Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });
    const { data: shrimpSeeds } = useQuery({
        queryKey: ['shrimp-seeds-all-warehouses-farm-screen', warehouses],
        queryFn: async () => {
            if (!warehouses || warehouses.length === 0) return [];

            try {
                const promises = warehouses.map(w =>
                    warehouseApi.getShrimpSeeds(w.id).catch(() => ({ data: { items: [] } } as any))
                );
                const results = await Promise.all(promises);
                const allItems = results.reduce<any[]>((acc, r: any) => {
                    if (r?.data?.items) {
                        return acc.concat(r.data.items);
                    }
                    return acc;
                }, []);
                const seen = new Set();
                return allItems.filter((item: any) => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
            } catch (error) {
                console.warn('Failed to fetch seeds from warehouses', error);
                return [];
            }
        },
        enabled: !!warehouses && warehouses.length > 0,
    });

    const foundCycle = useMemo(() => {
        if (!pond?.id) return null;
        const cyclesForPond = getCyclesByPondId(pond.id);
        if (cyclesForPond.length === 0) return null;
        const cycleInReceiving = cyclesForPond.find(cycle =>
            cycle.receivingPonds?.includes(pond.id)
        );
        if (cycleInReceiving) return cycleInReceiving;
        return cyclesForPond[0] || null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pond?.id, getCyclesByPondId, cycles]);
    const currentCycle: CycleData | null = useMemo(() => {
        const currentCycleData = pond?.id ? activeCycles[pond.id] : null;
        return currentCycleData || foundCycle;
    }, [pond?.id, activeCycles, foundCycle]);

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

    const { handleAddJobItem, handleEditJobItem, handleJobPress } = usePondJobHandlers(
        pond,
        setIsMeasureSizeModalVisible,
        apiMeasureSizeJobs
    );

    const [refreshing, setRefreshing] = useState(false);
    const headerDisplayType = undefined;

    const {
        data: cyclesData,
        refetch: refetchCycles,
        isRefetching: isRefetchingCycles,
    } = useCyclesByPond(pond?.id || '');
    const setCycles = useFarmStore(state => state.setCycles);
    const saveActiveCycle = useFarmStore(state => state.saveActiveCycle);
    const deleteActiveCycle = useFarmStore(state => state.deleteActiveCycle);

    useEffect(() => {
        if (cyclesData) {
            setCycles(cyclesData);

            // Find and sync active cycle for this pond
            if (pond?.id) {
                const activeForPond = cyclesData.find(
                    (c: any) =>
                        (c.pondId === pond.id || c.sourcePonds?.includes(pond.id)) &&
                        c.status !== 'Completed' &&
                        c.status !== 'Canceled' &&
                        c.status !== 'Hoàn thành'
                );

                if (activeForPond) {
                    const syncCycleToStore = (data: any) => {
                        const mappedCycle = {
                            ...data,
                            cycleName: data.name || data.cycleName,
                            stockingQuantity:
                                data.stockingQuantity || (data as any).totalStocking || 0,
                            stockingDate: formatDate(
                                new Date((data as any).createdAt || data.stockingDate || new Date())
                            ),
                            status:
                                data.status === 'InProgress'
                                    ? 'Chưa hoàn thành'
                                    : data.status === 'Completed'
                                    ? 'Hoàn thành'
                                    : data.status,
                        };
                        saveActiveCycle(pond.id, mappedCycle);
                    };

                    if (activeForPond.id) {
                        cycleApi
                            .getCycleDetail(pond.id, activeForPond.id)
                            .then(detail => {
                                if (detail) {
                                    syncCycleToStore(detail);
                                } else {
                                    syncCycleToStore(activeForPond);
                                }
                            })
                            .catch(err => {
                                console.warn(
                                    'Failed to fetch cycle detail in screen, using list data',
                                    err
                                );
                                syncCycleToStore(activeForPond);
                            });
                    } else {
                        syncCycleToStore(activeForPond);
                    }
                } else {
                    deleteActiveCycle(pond.id);
                }
            }
        }
    }, [cyclesData, setCycles, saveActiveCycle, deleteActiveCycle, pond?.id]);

    // Refetch cycles when screen gains focus (e.g., after editing)
    useFocusEffect(
        useCallback(() => {
            refetchCycles();
        }, [refetchCycles])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchMasterData(), refetchCycles()]);
        } catch (error) {
            console.error('Refresh master data failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchMasterData, refetchCycles]);

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
                            {isLoading || isRefetchingCycles ? (
                                <PondJobSkeleton />
                            ) : (
                                <>
                                    {currentCycle ? (
                                        <View style={styles.cycleCardWrapper}>
                                            <CycleCard
                                                cycleName={currentCycle.cycleName || 'Chưa đặt tên'}
                                                startDate={currentCycle?.stockingDate ?? ''}
                                                doc={calculateDOC(currentCycle?.stockingDate ?? '')}
                                                stockingQuantity={
                                                    currentCycle?.stockingQuantity || 0
                                                }
                                                breed={
                                                    currentCycle.breedName ||
                                                    shrimpSeeds?.find(
                                                        (s: any) =>
                                                            s.id === currentCycle.breedSource ||
                                                            s.id ===
                                                                (currentCycle as any)
                                                                    .warehouseItemId
                                                    )?.materialName ||
                                                    breedOptions.find(
                                                        b =>
                                                            b.value === currentCycle.breedSource ||
                                                            b.value ===
                                                                (currentCycle as any)
                                                                    .warehouseItemId
                                                    )?.label ||
                                                    'N/A'
                                                }
                                                // Cho phép bấm vào thẻ để sửa
                                                onPress={() =>
                                                    navigation.navigate('CycleDetail', {
                                                        pondId: pond.id,
                                                        cycleData: currentCycle,
                                                    })
                                                }
                                            />
                                            {currentCycle.transferInfo && (
                                                <CycleCard
                                                    cycleName={
                                                        currentCycle.transferInfo.originalCycle
                                                            .cycleName || 'Chu kỳ ao vèo'
                                                    }
                                                    startDate={
                                                        currentCycle.transferInfo.originalCycle
                                                            .stockingDate
                                                    }
                                                    endDate={currentCycle.transferInfo.transferDate}
                                                    doc={
                                                        currentCycle.transferInfo.originalCycle
                                                            .doc || 0
                                                    }
                                                    stockingQuantity={
                                                        currentCycle.transferInfo.originalCycle
                                                            .stockingQuantity || 0
                                                    }
                                                    breed={
                                                        breedOptions.find(
                                                            b =>
                                                                b.value ===
                                                                currentCycle.transferInfo
                                                                    ?.originalCycle.breedSource
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

                                    <JobListCard
                                        jobs={jobs}
                                        onPressJob={handleJobPress}
                                        onPressAddJob={handleAddJobItem}
                                        onEditJobItem={handleEditJobItem}
                                    />
                                </>
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
        paddingBottom: 100,
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
        marginBottom: spacing.sm,
        gap: 8,
    },
});
