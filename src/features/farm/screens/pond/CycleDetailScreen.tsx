import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { CycleData } from '@/features/farm/types/farm.types';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';
import { usePondsByZone } from '@/features/farm/hooks/usePonds';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { farmKeys } from '@/features/farm/hooks/farmKeys';

import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CycleDetail'>;

export const CycleDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ScreenRouteProp>();
    const { cycleData: initialCycleData, pondId } = route.params || {};
    const {
        data: fetchedCycleData,
        refetch,
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: farmKeys.cycles.detail(pondId, initialCycleData?.id || ''),
        queryFn: async () => {
            if (!pondId || !initialCycleData?.id) return null;
            return await cycleApi.getCycleDetail(pondId, initialCycleData.id);
        },
        enabled: !!pondId && !!initialCycleData?.id,
        initialData: initialCycleData,
        refetchOnMount: 'always',
        staleTime: 0,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const activeCycleData = (fetchedCycleData || initialCycleData) as CycleData | undefined;

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const breedOptions = useFarmStore(state => state.breedOptions);
    // Remove season store dependency, verify API season object directly first

    const calculateDOC = useFarmStore(state => state.calculateDOC);
    const getPondById = useFarmStore(state => state.getPondById);
    const pond = getPondById(pondId);

    // --- Dynamic Breed Name Fetching (same as ShrimpPond) ---
    // Get zone ID from pond store or active cycle data
    const effectiveZoneId = useMemo(() => {
        if (pond?.zoneId) return pond.zoneId.toString();
        if (activeCycleData?.pond?.zoneId) return activeCycleData.pond.zoneId.toString();
        return null;
    }, [pond?.zoneId, activeCycleData?.pond?.zoneId]);

    // Fetch Warehouses for this Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });

    // Fetch Shrimp Seeds from ALL warehouses
    const { data: shrimpSeeds } = useQuery({
        queryKey: ['shrimp-seeds-cycle-detail', effectiveZoneId, warehouses?.length],
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
                // Deduplicate by ID
                const seen = new Set();
                return allItems.filter((item: any) => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
            } catch {
                return [];
            }
        },
        enabled: !!warehouses && warehouses.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    const breedLabel = useMemo(() => {
        // 1. Prefer saved breedName from activeCycleData
        if (activeCycleData?.breedName) return activeCycleData.breedName;

        // 2. Check warehouseItem object (if API returns it)
        const warehouseItem = (activeCycleData as any)?.warehouseItem;
        if (warehouseItem?.materialName) return warehouseItem.materialName;
        if (warehouseItem?.name) return warehouseItem.name;

        // 3. Check initialCycleData breedName
        if (initialCycleData?.breedName) return initialCycleData.breedName;

        // 4. Match from fetched shrimpSeeds using warehouseItemId
        const warehouseItemId =
            (activeCycleData as any)?.warehouseItemId || activeCycleData?.breedSource;
        if (warehouseItemId && shrimpSeeds && shrimpSeeds.length > 0) {
            const matchedSeed = shrimpSeeds.find((seed: any) => seed.id === warehouseItemId);
            if (matchedSeed?.materialName) return matchedSeed.materialName;
            if (matchedSeed?.name) return matchedSeed.name;
        }

        // 5. Fallback to breedOptions lookup
        const breedId = activeCycleData?.breedSource || warehouseItemId;
        if (breedId) {
            const found = breedOptions.find(b => b.value === breedId)?.label;
            if (found) return found;
        }

        return 'N/A';
    }, [activeCycleData, initialCycleData, breedOptions, shrimpSeeds]);

    const seasonLabel = useMemo(() => {
        // API returns season as object with name
        if (activeCycleData?.season && typeof activeCycleData.season === 'object') {
            return activeCycleData.season.name || 'N/A';
        }
        // Legacy: ID lookup (should usually be object now)
        return 'N/A';
    }, [activeCycleData]);

    // Calculate DOC (Days of Culture)
    const doc = useMemo(() => {
        return calculateDOC(activeCycleData?.stockingDate);
    }, [activeCycleData?.stockingDate, calculateDOC]);

    // Get transfer info if exists
    const transferInfo = activeCycleData?.transferInfo;

    // Fetch all ponds in the zone to find stock transfers
    const { data: zonePondsData } = usePondsByZone(effectiveZoneId);

    // Flatten zone ponds
    const zonePonds = useMemo(() => {
        if (!zonePondsData?.pages) return [];
        return zonePondsData.pages.reduce<{ id: string; name: string }[]>(
            (acc, page) => [
                ...acc,
                ...(page.items || []).map((p: { id: string; name: string }) => ({
                    id: p.id,
                    name: p.name,
                })),
            ],
            []
        );
    }, [zonePondsData]);

    // Fetch stock transfers from all zone ponds and find incoming transfer to current pond
    const { data: incomingTransfer } = useQuery({
        queryKey: ['incoming-stock-transfer', pondId, zonePonds.length],
        queryFn: async () => {
            // Try fetching from current pond first (in case API returns incoming transfers or mixed)
            if (pondId) {
                try {
                    await stockTransferApi.getList(pondId, {
                        PageSize: 100,
                        OrderBy: 'CreatedAt desc',
                    });
                } catch (_e) {
                    // ignore
                }
            }

            if (!pondId || zonePonds.length === 0) return null;

            // Search stock transfers from each pond in zone
            for (const zonePond of zonePonds) {
                if (zonePond.id === pondId) continue; // Skip current pond

                try {
                    const response = await stockTransferApi.getList(zonePond.id, {
                        PageSize: 100,
                        OrderBy: 'CreatedAt desc',
                    });

                    const transfers = response?.data?.items || [];

                    // Find transfer where current pond is in toPonds
                    for (const transfer of transfers) {
                        const matchingToPond = transfer.toPonds?.find(
                            (tp: { toPondId: string }) => tp.toPondId === pondId
                        );
                        if (matchingToPond) {
                            return {
                                fromPondId: transfer.fromPondId,
                                fromPondName: zonePond.name,
                                shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                quantity: matchingToPond.quantity,
                            };
                        }
                    }
                } catch (_error) {
                    // ignore
                }
            }
            return null;
        },
        enabled: !!pondId && zonePonds.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    // Get source pond name from incoming stock transfer
    const sourcePondName = useMemo(() => {
        // 1. Check transferInfo first
        if (transferInfo?.sourcePondName) return transferInfo.sourcePondName;
        // 2. Get from incoming stock transfer
        if (incomingTransfer?.fromPondName) return incomingTransfer.fromPondName;
        // 3. Fallback
        return '-';
    }, [transferInfo, incomingTransfer]);

    // Get shrimp size from incoming stock transfer (cỡ tôm đã lưu khi tạo phiếu sang ao)
    const shrimpSize = useMemo(() => {
        // 1. Check shrimpSize from incoming stock transfer
        if (incomingTransfer?.shrimpSizePcsPerKg) {
            return `${incomingTransfer.shrimpSizePcsPerKg}`;
        }
        // 2. Check transferInfo fallback
        if (transferInfo?.shrimpSize) return transferInfo.shrimpSize;
        // 3. Fallback
        return '-';
    }, [incomingTransfer, transferInfo]);

    const [refreshing, setRefreshing] = useState(false);
    const [isCycleNameExpanded, setIsCycleNameExpanded] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Formatting date
    const displayStockingDate = useMemo(() => {
        if (!activeCycleData?.stockingDate) return '---';
        if (
            typeof activeCycleData.stockingDate === 'string' &&
            activeCycleData.stockingDate.includes('/')
        ) {
            return activeCycleData.stockingDate;
        }
        return formatDate(new Date(activeCycleData.stockingDate));
    }, [activeCycleData?.stockingDate]);

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="cycle-detail"
                titleAlign="left"
                onBack={() => navigation.goBack()}
                title={
                    <View style={styles.leftTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {activeCycleData?.cycleName}
                        </Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {displayStockingDate} - nay
                        </Text>
                    </View>
                }
                rightAction={
                    <View style={styles.badgeWrapper}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText} numberOfLines={1}>
                                {activeCycleData?.status === 'InProgress' ||
                                activeCycleData?.status === 'Active'
                                    ? 'Chưa hoàn thành'
                                    : activeCycleData?.status === 'Completed'
                                    ? 'Hoàn thành'
                                    : activeCycleData?.status || 'Chưa hoàn thành'}
                            </Text>
                        </View>
                    </View>
                }
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || (isLoading && !initialCycleData) || isRefetching}
                        onRefresh={onRefresh}
                        colors={[colors.black]}
                    />
                }
            >
                {/* Thông tin thả giống - Chu kỳ gốc của ao nhận */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderWithBorder}>
                        <Text style={styles.cardTitle}>Thông tin thả giống</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() =>
                                    navigation.navigate('CreateCycle', {
                                        pondId,
                                        initialData: activeCycleData,
                                        zoneId: pond?.zoneId?.toString(),
                                    })
                                }
                            >
                                <EditIcon />
                            </TouchableOpacity>
                            <Ionicons name="chevron-up" size={20} color={colors.gray[700]} />
                        </View>
                    </View>

                    {/* ... phần nội dung infoRow giữ nguyên */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Vụ nuôi:</Text>
                            <Text style={styles.value}>{seasonLabel}</Text>
                        </View>
                        {/* Custom row for Tên chu kỳ with expand/collapse */}
                        <View style={[styles.infoRow, styles.cycleNameRow]}>
                            <Text style={[styles.label, styles.cycleNameLabel]}>Tên chu kỳ:</Text>
                            <View style={styles.cycleNameValueContainer}>
                                <Text
                                    style={[styles.value, styles.cycleNameText]}
                                    numberOfLines={isCycleNameExpanded ? undefined : 1}
                                >
                                    {activeCycleData?.cycleName || '---'}
                                </Text>
                                {(activeCycleData?.cycleName?.length || 0) > 25 && (
                                    <TouchableOpacity
                                        onPress={() => setIsCycleNameExpanded(!isCycleNameExpanded)}
                                        style={styles.expandButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons
                                            name={
                                                isCycleNameExpanded ? 'chevron-up' : 'chevron-down'
                                            }
                                            size={18}
                                            color={colors.gray[500]}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Tôm giống:</Text>
                            <Text style={styles.value}>{breedLabel}</Text>
                        </View>

                        <View style={[styles.line]} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ngày thả:</Text>
                            <Text style={styles.value}>{displayStockingDate}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số ngày nuôi (DOC):</Text>
                            <Text style={styles.value}>{doc} ngày</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số lượng thả (Pls):</Text>
                            <Text style={styles.value}>
                                {activeCycleData?.stockingQuantity?.toLocaleString() ||
                                    activeCycleData?.totalStocking?.toLocaleString() ||
                                    0}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Thông tin sang ao - Luôn hiển thị */}
                <View style={[styles.card, { marginTop: spacing.sm }]}>
                    <View style={styles.cardHeaderWithBorder}>
                        <Text style={styles.cardTitle}>Thông tin sang ao</Text>
                        <Ionicons name="chevron-up" size={20} color={colors.gray[700]} />
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ngày nhận ao:</Text>
                            <Text style={styles.value}>{displayStockingDate}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Chuyển sang từ ao:</Text>
                            <Text style={styles.value}>{sourcePondName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ngày nuôi (DOC):</Text>
                            <Text style={styles.value}>{doc} ngày</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Cỡ tôm (con/kg)</Text>
                            <Text style={styles.value}>{shrimpSize}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Số lượng tôm sang (con):</Text>
                            <Text style={styles.value}>
                                {activeCycleData?.stockingQuantity?.toLocaleString() ||
                                    activeCycleData?.totalStocking?.toLocaleString() ||
                                    0}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    badgeWrapper: {
        height: 40,
        minWidth: 110,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    statusBadge: {
        backgroundColor: colors.yellow[50],
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.yellow[300],
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: colors.orange[500],
        fontWeight: typography.fontWeight.regular,
        lineHeight: 20,
    },
    content: {
        paddingVertical: spacing.sm,
    },
    card: {
        backgroundColor: colors.white,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    cardHeaderWithBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gray[900],
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // NÚT BỌC 32x32 THEO Ý BA
    iconBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        backgroundColor: colors.gray[50],
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    line: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    infoContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        gap: 8,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    value: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    leftTitleContainer: {
        alignItems: 'flex-start',
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
    },
    // Transfer Card Styles
    transferCard: {
        marginTop: spacing.sm,
    },
    receivingPondCard: {
        backgroundColor: colors.backgroundPrimary,
        borderRadius: 8,
        padding: spacing.sm,
        gap: 8,
    },
    subRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: spacing.md,
    },
    subLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
    },
    subValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        marginTop: spacing.xs,
    },
    cycleNameRow: {
        alignItems: 'flex-start',
    },
    cycleNameLabel: {
        marginTop: 2,
    },
    cycleNameValueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cycleNameText: {
        textAlign: 'right',
        flex: 1,
    },
    expandButton: {
        marginLeft: 6,
        paddingHorizontal: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
