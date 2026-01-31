import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CycleData } from '@/features/farm/types/farm.types';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/features/farm/utils/dateUtils';

// Sử dụng HeaderFarm có sẵn
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';

import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CycleDetail'>;

export const CycleDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ScreenRouteProp>();

    // Lấy dữ liệu từ params truyền sang
    const { cycleData: initialCycleData, pondId } = route.params || {};

    // Use React Query to fetch fresh detail data
    const {
        data: fetchedCycleData,
        refetch,
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['cycleDetail', pondId, initialCycleData?.id],
        queryFn: async () => {
            if (!pondId || !initialCycleData?.id) return null;
            const rawData = await cycleApi.getCycleDetail(pondId, initialCycleData.id);
            // Map raw API data to CycleData interface
            if (rawData) {
                return {
                    ...rawData,
                    cycleName: rawData.name || (rawData as any).cycleName,
                    breedSource: rawData.breedSource || (rawData as any).warehouseItemId,
                    stockingDate: (rawData as any).createdAt || rawData.stockingDate,
                    season: rawData.season,
                } as CycleData;
            }
            return null;
        },
        enabled: !!pondId && !!initialCycleData?.id,
        initialData: initialCycleData,
    });

    const activeCycleData = (fetchedCycleData || initialCycleData) as CycleData | undefined;

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const breedOptions = useFarmStore(state => state.breedOptions);
    // Remove season store dependency, verify API season object directly first

    const calculateDOC = useFarmStore(state => state.calculateDOC);
    const getPondById = useFarmStore(state => state.getPondById);
    const pond = getPondById(pondId);

    const breedLabel = useMemo(() => {
        if (!activeCycleData?.breedSource) return 'N/A';
        // 1. Prefer saved name
        if (activeCycleData.breedName) return activeCycleData.breedName;
        // 2. Fallback to options
        return breedOptions.find(b => b.value === activeCycleData.breedSource)?.label || 'N/A';
    }, [activeCycleData, breedOptions]);

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

    const [refreshing, setRefreshing] = useState(false);
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
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Tên chu kỳ:</Text>
                            <Text style={styles.value}>{activeCycleData?.cycleName || '---'}</Text>
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

                {/* Thông tin sang ao - Hiển thị nếu có transferInfo */}
                {transferInfo && (
                    <View style={[styles.card, styles.transferCard]}>
                        <View style={styles.cardHeaderWithBorder}>
                            <Text style={styles.cardTitle}>Thông tin sang ao</Text>
                            <Ionicons name="chevron-up" size={20} color={colors.gray[700]} />
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ngày sang ao:</Text>
                                <Text style={styles.value}>
                                    {formatDate(new Date(transferInfo.transferDate))}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Cỡ tôm (con/kg)</Text>
                                <Text style={styles.value}>{transferInfo.shrimpSize}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Tổng số tôm dự kiến (con):</Text>
                                <Text style={styles.value}>
                                    {transferInfo.totalEstimatedShrimp?.toLocaleString() || 0}
                                </Text>
                            </View>

                            <View style={[styles.line]} />

                            {/* Ao nhận header - outside of card */}
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ao nhận</Text>
                                <Text style={styles.value}>1</Text>
                            </View>

                            {/* Card for receiving ponds list */}
                            <View style={styles.receivingPondCard}>
                                {/* Hiển thị ao nguồn và số lượng */}
                                <View style={styles.subRow}>
                                    <Text style={styles.subLabel}>
                                        {transferInfo.sourcePondName}
                                    </Text>
                                    <Text style={styles.subValue}>
                                        {transferInfo.quantity?.toLocaleString() || 0}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    // ... các styles khác giữ nguyên
    badgeWrapper: {
        height: 40,
        minWidth: 110, // Ensure specific width for balance
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    // ... statusBadge style kept ...
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
        marginLeft: 8, // Ensures ~16px total spacing from back button (8px from header + 8px here)
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
});
