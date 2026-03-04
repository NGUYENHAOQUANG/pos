import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { usePondsByZone } from '@/features/farm/hooks/usePonds';
import { useIncomingStockTransfer } from '@/features/farm/hooks/stock-transfer/useStockTransfer';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';

import { CycleDetailContent } from '@/features/farm/screens/pond/cycle-detail/CycleDetailContent';
import { AppStackParamList } from '@/app/navigation/AppStack';

type ScreenRouteProp = RouteProp<AppStackParamList, 'CycleDetailScreen'>;
export const CycleDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId, warehouseId } = route.params ?? {};

    const {
        data: activeCycleData,
        refetch,
        isLoading,
        isRefetching,
    } = useActiveCycle(pondId ?? '');

    const { data: shrimpSeeds, refetch: refetchShrimpSeeds } = useShrimpSeeds(warehouseId);

    const { data: zonePondsData } = usePondsByZone(zoneId ?? null);

    const zonePonds = useMemo(() => {
        if (!zonePondsData) return [];
        return zonePondsData.map((p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name,
        }));
    }, [zonePondsData]);

    const { data: incomingTransfer } = useIncomingStockTransfer(pondId, zonePonds);

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

    const transferInfo = activeCycleData?.notes;

    const breedLabel = useMemo(
        () => pondDetailService.getBreedName(activeCycleData, shrimpSeeds),
        [activeCycleData, shrimpSeeds]
    );

    const seasonLabel = useMemo(
        () => (activeCycleData?.season ? activeCycleData.season.name : 'N/A'),
        [activeCycleData?.season]
    );

    const doc = useMemo(
        () => pondDetailService.calculateDOC(activeCycleData?.createdAt),
        [activeCycleData?.createdAt]
    );
    const displayStockingDate = useMemo(
        () =>
            activeCycleData?.createdAt ? formatDate(new Date(activeCycleData.createdAt)) : '---',
        [activeCycleData?.createdAt]
    );
    const sourcePondName = useMemo(() => {
        if (transferInfo) return transferInfo;
        if (incomingTransfer?.fromPondName) return incomingTransfer.fromPondName;
        return '--';
    }, [transferInfo, incomingTransfer]);

    const shrimpSize = useMemo(() => {
        return incomingTransfer?.shrimpSizePcsPerKg
            ? `${incomingTransfer.shrimpSizePcsPerKg}`
            : transferInfo ?? '--';
    }, [incomingTransfer?.shrimpSizePcsPerKg, transferInfo]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

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
            <CycleDetailContent
                activeCycleData={activeCycleData ?? undefined}
                seasonLabel={seasonLabel}
                breedLabel={breedLabel}
                doc={doc}
                sourcePondName={sourcePondName}
                shrimpSize={shrimpSize}
                displayStockingDate={displayStockingDate}
                refreshing={refreshing || isLoading || isRefetching}
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
