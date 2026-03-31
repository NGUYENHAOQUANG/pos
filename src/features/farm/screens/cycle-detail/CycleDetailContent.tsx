import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors, spacing } from '@/styles';
import { CycleData } from '@/features/farm/types/cycle.types';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';
import { DetailRow } from '@/features/material/components/DetailRow';
import { IStockTransferDetail } from '@/features/farm/types/stockTransfer.types';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { IncomingStockTransfer } from '@/features/farm/hooks/stock-transfer/useStockTransfer';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { formatDate } from '@/features/farm/utils/dateUtils';
import type { HarvestType } from '@/features/farm/types/harvestRecord.types';
import { getHarvestTypeDisplay } from '@/features/farm/schemas/harvestFormSchema';
import { POND_TYPES } from '@/features/farm/types/farm.types';

type CycleHarvestType = HarvestType | 'CloseCycle';

interface HarvestSummaryItem {
    id: string;
    type: CycleHarvestType;
    date: string;
    shrimpSize?: string;
    totalWeightKg?: string;
    revenue?: string;
}

interface CycleDetailContentProps {
    activeCycleData?: CycleData;
    shrimpSeeds?: IShrimpSeed[];
    incomingTransfer?: IncomingStockTransfer | null;
    transferDetail?: IStockTransferDetail;
    pondType?: string;
    refreshing: boolean;
    harvestSummary?: HarvestSummaryItem[];
    onRefresh: () => void;
    onEditPress: () => void;
}

export const CycleDetailContent: React.FC<CycleDetailContentProps> = ({
    activeCycleData,
    shrimpSeeds,
    incomingTransfer,
    pondType,
    refreshing,
    transferDetail,
    harvestSummary,
    onRefresh,
    onEditPress,
}) => {
    const [isStockingExpanded] = useState(true);
    const [isTransferExpanded, setIsTransferExpanded] = useState(true);
    const [isOutgoingTransferExpanded, setIsOutgoingTransferExpanded] = useState(true);
    const [isHarvestExpanded, setIsHarvestExpanded] = useState(true);

    const isNursery = pondType === POND_TYPES.NURSERY;
    const isShowHarvest = pondType === POND_TYPES.CULTIVATION || pondType === POND_TYPES.READY;

    // Derive display values from raw data
    const seasonLabel = useMemo(
        () => (activeCycleData?.season ? activeCycleData.season.name : 'N/A'),
        [activeCycleData?.season]
    );

    const breedLabel = useMemo(
        () => pondDetailService.getBreedName(activeCycleData, shrimpSeeds),
        [activeCycleData, shrimpSeeds]
    );

    // DOC & stocking date: use cycle's createdAt for the stocking section
    const doc = useMemo(
        () => pondDetailService.calculateDOC(activeCycleData?.createdAt),
        [activeCycleData?.createdAt]
    );

    const displayStockingDate = useMemo(
        () =>
            activeCycleData?.createdAt ? formatDate(new Date(activeCycleData.createdAt)) : '---',
        [activeCycleData?.createdAt]
    );

    // Transfer-specific values (for nhận ao / sang ao sections)
    const transferDate = useMemo(
        () =>
            incomingTransfer?.createdAt ? formatDate(new Date(incomingTransfer.createdAt)) : '---',
        [incomingTransfer?.createdAt]
    );

    const transferDOC = useMemo(
        () => pondDetailService.calculateDOC(incomingTransfer?.createdAt),
        [incomingTransfer?.createdAt]
    );

    const sourcePondName = useMemo(() => {
        return incomingTransfer?.fromPondName || '--';
    }, [incomingTransfer]);

    const shrimpSize = useMemo(() => {
        return incomingTransfer?.shrimpSizePcsPerKg
            ? `${incomingTransfer.shrimpSizePcsPerKg}`
            : '--';
    }, [incomingTransfer?.shrimpSizePcsPerKg]);

    const transferQuantity = useMemo(() => {
        return incomingTransfer?.quantity?.toLocaleString() || '0';
    }, [incomingTransfer?.quantity]);

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.black]}
                />
            }
        >
            {/* Thông tin thả giống - Chu kỳ gốc của ao nhận */}
            <View style={styles.card}>
                <CollapseHead
                    title="Thông tin thả giống"
                    isExpanded={isStockingExpanded}
                    rightComponent={
                        <TouchableOpacity style={styles.iconBtn} onPress={onEditPress}>
                            <EditIcon />
                        </TouchableOpacity>
                    }
                    style={styles.cardHeader}
                />

                {isStockingExpanded && (
                    <View style={styles.infoContainer}>
                        <DetailRow label="Vụ nuôi:" value={seasonLabel} />
                        <DetailRow label="Tên chu kỳ:" value={activeCycleData?.name || '---'} />
                        <DetailRow label="Tôm giống:" value={breedLabel} />

                        <View style={styles.line} />

                        <DetailRow label="Ngày thả:" value={displayStockingDate} />
                        <DetailRow label="Ngày nuôi (DOC):" value={`${doc} ngày`} />
                        <DetailRow
                            label="Số lượng thả (Pls):"
                            value={activeCycleData?.totalStocking?.toLocaleString() || 0}
                        />
                    </View>
                )}
            </View>

            {/* Thông tin nhận ao - Hiển thị khi không phải Ao vèo VÀ có transfer hợp lệ */}
            {!isNursery && incomingTransfer && (
                <View style={[styles.card, { marginTop: spacing.sm }]}>
                    <CollapseHead
                        title="Thông tin sang ao"
                        isExpanded={isTransferExpanded}
                        onToggle={() => setIsTransferExpanded(!isTransferExpanded)}
                        style={styles.cardHeader}
                    />

                    {isTransferExpanded && (
                        <View style={styles.infoContainer}>
                            <DetailRow label="Ngày nhận ao:" value={transferDate} />
                            <DetailRow label="Chuyển sang từ ao:" value={sourcePondName} />
                            <DetailRow label="Ngày nuôi (DOC):" value={`${transferDOC} ngày`} />
                            <DetailRow label="Cỡ tôm (con/kg):" value={shrimpSize} />
                            <DetailRow label="Số lượng tôm sang (con):" value={transferQuantity} />
                        </View>
                    )}
                </View>
            )}

            {/* Thông tin sang ao (Đi) - Chỉ hiển thị khi có transferDetail thuộc chu kỳ này */}
            {transferDetail && (
                <View style={[styles.card, { marginTop: spacing.sm }]}>
                    <CollapseHead
                        title="Thông tin sang ao"
                        isExpanded={isOutgoingTransferExpanded}
                        onToggle={() => setIsOutgoingTransferExpanded(!isOutgoingTransferExpanded)}
                        style={styles.cardHeader}
                    />

                    {isOutgoingTransferExpanded && (
                        <View style={styles.infoContainer}>
                            <DetailRow label="Vụ nuôi:" value={seasonLabel} />
                            <DetailRow label="Tên chu kỳ:" value={activeCycleData?.name || '---'} />
                            <DetailRow label="Tôm giống:" value={breedLabel} />

                            <View style={styles.line} />

                            <View style={[styles.receivingPondHeader]}>
                                <Text style={styles.receivingPondTitle}>Ao nhận</Text>
                                <Text style={styles.receivingPondCount}>
                                    {transferDetail.toPonds?.length || 0}
                                </Text>
                            </View>

                            <View style={styles.pondListBox}>
                                {transferDetail.toPonds?.map(tp => (
                                    <View key={tp.pondId || tp.toPondId} style={styles.pondRow}>
                                        <Text style={styles.pondName}>{tp.pondName || '---'}</Text>
                                        <Text style={styles.pondQuantity}>
                                            {tp.quantity?.toLocaleString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {isShowHarvest &&
                harvestSummary &&
                harvestSummary.length > 0 &&
                harvestSummary.map((item, index) => (
                    <View
                        key={item.id}
                        style={[
                            styles.card,
                            { marginTop: spacing.sm },
                            index === harvestSummary.length - 1
                                ? { marginBottom: spacing.sm }
                                : null,
                        ]}
                    >
                        <CollapseHead
                            title="Thông tin thu hoạch"
                            isExpanded={isHarvestExpanded}
                            onToggle={() => setIsHarvestExpanded(!isHarvestExpanded)}
                            style={styles.cardHeader}
                        />

                        {isHarvestExpanded && (
                            <View style={styles.infoContainer}>
                                <DetailRow
                                    label={
                                        item.type === 'CloseCycle'
                                            ? 'Ngày đóng chu kỳ:'
                                            : 'Ngày thu hoạch:'
                                    }
                                    value={item.date}
                                />
                                <DetailRow
                                    label="Loại thu hoạch:"
                                    value={
                                        item.type === 'FullHarvest'
                                            ? 'Thu hết'
                                            : getHarvestTypeDisplay(item.type as HarvestType)
                                    }
                                />
                                {item.type !== 'CloseCycle' && (
                                    <>
                                        <DetailRow
                                            label="Cỡ tôm (con/kg):"
                                            value={item.shrimpSize}
                                        />
                                        <DetailRow
                                            label="Sản lượng (kg):"
                                            value={item.totalWeightKg}
                                        />
                                        <DetailRow
                                            label="Doanh thu (VND)"
                                            value={item.revenue}
                                            valueStyle={{ color: colors.success }}
                                        />
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                ))}
            <View style={{ height: 200 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {},
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginHorizontal: spacing.md,
    },
    cardHeader: {
        backgroundColor: colors.transparent,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingHorizontal: spacing.md,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    line: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: spacing.md,
    },
    infoContainer: {
        paddingBottom: 16,
        paddingHorizontal: spacing.md,
        gap: 12,
    },
    receivingPondHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    receivingPondTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
    receivingPondCount: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    pondListBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.sm,
        gap: spacing.xs,
    },
    pondRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pondName: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
    pondQuantity: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
});
