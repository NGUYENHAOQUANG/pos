import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useCycleDetail } from '@/features/farm/hooks/useCycle';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { useIncomingStockTransfer } from '@/features/farm/hooks/stock-transfer/useStockTransfer';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';

import { CycleDetailContent } from '@/features/farm/screens/cycle-detail/CycleDetailContent';
import { CycleDetailSkeleton } from '@/features/farm/components/skeleton/CycleDetailSkeleton';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { Tag } from '@/features/farm/components/pond/Tag';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import { usePondCategories } from '@/features/farm/hooks/usePondCategories';
import { useHarvestRecords } from '@/features/farm/hooks/useHarvestRecord';
import type { HarvestType } from '@/features/farm/types/harvestRecord.types';

type ScreenRouteProp = RouteProp<AppStackParamList, 'CycleDetailScreen'>;
export const CycleDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId, warehouseId, cycleId } = route.params ?? {};

    const {
        data: cycleDetailDataHook,
        refetch,
        isLoading,
        isRefetching,
    } = useCycleDetail(pondId ?? '', cycleId ?? '');

    const activeCycleData = cycleDetailDataHook?.data;

    const { data: shrimpSeeds, refetch: refetchShrimpSeeds } = useShrimpSeeds(warehouseId);

    const { data: pondData, refetch: refetchPondDetail } = usePondDetail(
        zoneId ?? '',
        pondId ?? ''
    );
    const { data: categoriesResponse } = usePondCategories();

    const pondType = useMemo(() => {
        if (typeof pondData?.type === 'string') return pondData.type;
        if (pondData?.type?.name) return pondData.type.name;

        const matchedCategory = categoriesResponse?.items?.find(
            c => c.id === pondData?.pondCategoryId
        );
        return matchedCategory?.name;
    }, [pondData, categoriesResponse]);

    const { data: incomingTransfer } = useIncomingStockTransfer({
        pondId,
        cycleId,
        pondType,
    });

    const transferDetail = incomingTransfer?.transferDetail;

    const { data: harvestRecordsData } = useHarvestRecords(pondId ?? '', {
        CycleId: cycleId ?? undefined,
        PageSize: 1000,
        OrderBy: 'CreatedAt desc',
    });

    // --- Effects ---
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );
    useFocusEffect(
        useCallback(() => {
            refetchShrimpSeeds?.();
        }, [refetchShrimpSeeds])
    );

    const [refreshing, setRefreshing] = useState(false);

    const displayStockingDate = useMemo(
        () =>
            activeCycleData?.createdAt ? formatDate(new Date(activeCycleData.createdAt)) : '---',
        [activeCycleData?.createdAt]
    );

    type CycleHarvestType = HarvestType | 'CloseCycle';

    const harvestSummary = useMemo(() => {
        if (!activeCycleData) return undefined;

        const allItems = harvestRecordsData?.data?.items ?? [];
        const currentCycleId = activeCycleData.id;

        const items = allItems.filter(item => item.cycleId === currentCycleId);

        if (!items.length) {
            if (activeCycleData.status === 'Completed') {
                const end =
                    activeCycleData.endDate ||
                    activeCycleData.editedAt ||
                    activeCycleData.createdAt ||
                    '';
                const dateStr = end ? formatDate(new Date(end)) : '---';
                return [
                    {
                        id: 'close-cycle',
                        type: 'CloseCycle' as CycleHarvestType,
                        date: dateStr,
                    },
                ];
            }
            return undefined;
        }

        const mapped = items
            .map(item => {
                const detail = item.harvestDetail ?? item.harvest;
                if (!detail) return null;

                const createdDate = item.createdAt ? new Date(item.createdAt) : null;
                const dateStr = createdDate ? formatDate(createdDate) : '---';

                const revenueValue = detail.revenue;
                const revenue =
                    typeof revenueValue === 'number'
                        ? revenueValue.toLocaleString()
                        : revenueValue != null
                        ? String(revenueValue)
                        : undefined;

                return {
                    id: item.id,
                    type: detail.harvestType as CycleHarvestType,
                    date: dateStr,
                    shrimpSize: detail.shrimpSize != null ? String(detail.shrimpSize) : undefined,
                    totalWeightKg:
                        detail.totalWeightKg != null ? String(detail.totalWeightKg) : undefined,
                    revenue,
                };
            })
            .filter(Boolean) as {
            id: string;
            type: CycleHarvestType;
            date: string;
            shrimpSize?: string;
            totalWeightKg?: string;
            revenue?: string;
        }[];

        // Sort by createdAt ascending (cũ -> mới)
        mapped.sort((a, b) => {
            const aRecord = allItems.find(x => x.id === a.id);
            const bRecord = allItems.find(x => x.id === b.id);
            const ta = aRecord?.createdAt ? new Date(aRecord.createdAt).getTime() : 0;
            const tb = bRecord?.createdAt ? new Date(bRecord.createdAt).getTime() : 0;
            return ta - tb;
        });

        return mapped;
    }, [harvestRecordsData, activeCycleData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetch(), refetchPondDetail()]);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, refetchPondDetail]);

    const isCompleted = activeCycleData?.status === 'Completed';
    const cycleTagStatus = isCompleted ? 'active' : 'preparing';
    const cycleTagLabel = isCompleted ? 'Hoàn thành' : activeCycleData?.status || 'Chưa hoàn thành';

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="cycle-detail"
                titleAlign="left"
                onBack={() => navigation.goBack()}
                title={
                    <View style={styles.leftTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {activeCycleData?.name}
                        </Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {displayStockingDate} - nay
                        </Text>
                    </View>
                }
                rightAction={
                    !isLoading && (
                        <View style={styles.badgeWrapper}>
                            <Tag status={cycleTagStatus} label={cycleTagLabel} />
                        </View>
                    )
                }
            />
            {isLoading ? (
                <CycleDetailSkeleton />
            ) : (
                <CycleDetailContent
                    activeCycleData={activeCycleData ?? undefined}
                    shrimpSeeds={shrimpSeeds}
                    incomingTransfer={incomingTransfer}
                    transferDetail={transferDetail}
                    pondType={pondType}
                    refreshing={refreshing || isRefetching}
                    harvestSummary={harvestSummary}
                    onRefresh={onRefresh}
                    onEditPress={() =>
                        navigation.navigate('CreateCycle', {
                            pondId,
                            zoneId: zoneId,
                            warehouseId,
                            cycleId: activeCycleData?.id,
                            isEditMode: true,
                        })
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    infoContainer: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    badgeWrapper: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
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
});
