/**
 * @file HarvestItemCard.tsx
 * @description Card item hiển thị thống kê thu hoạch theo dạng timeline
 */
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CaretDownIcon from '@/assets/Icon/IconReport/CaretDown.svg';
import { colors, typography, spacing } from '@/styles';
import { DetailRow } from '@/features/material/components/DetailRow';

import { HarvestRecordWithNames } from '@/features/reports/hooks/useHarvestStatsTable';
import { formatCurrencyValue } from '@/shared/utils/formatters';

interface Props {
    item: HarvestRecordWithNames;
    index: number;
}

const TIMELINE_SECONDARY_COLOR = colors.gray[200];

export const HarvestItemCard = ({ item, index }: Props) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => !prev);
    };

    return (
        <View style={styles.container}>
            {/* Timeline column */}
            <View style={styles.timelineColumn}>
                <View
                    style={[
                        styles.timelineDot,
                        index > 0 && { borderColor: TIMELINE_SECONDARY_COLOR },
                    ]}
                />
                <View
                    style={[
                        styles.timelineLine,
                        index > 0 && { backgroundColor: TIMELINE_SECONDARY_COLOR },
                    ]}
                />
            </View>

            {/* Content column */}
            <View style={styles.contentColumn}>
                {/* Top row: harvestDate + Xem thêm */}
                <View style={styles.topRow}>
                    <Text style={styles.dateText}>{item.formattedDate}</Text>
                    <TouchableOpacity
                        onPress={toggleExpand}
                        style={styles.topAction}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.topActionText}>
                            {expanded ? 'Thu gọn' : 'Xem thêm'}
                        </Text>
                        <CaretDownIcon
                            width={14}
                            height={14}
                            style={{ transform: [{ rotate: expanded ? '180deg' : '-90deg' }] }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Inner card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{item.pondName}</Text>

                    <View style={styles.content}>
                        {/* Main info */}
                        <DetailRow
                            label="Tổng thu hoạch:"
                            value={String(item.totalWeightKg)}
                            unit="kg"
                        />
                        <DetailRow label="Loại thu:" value={item.harvestType} />

                        {/* Expanded detail info */}
                        {expanded && (
                            <View style={styles.expandedContent}>
                                <DetailRow
                                    label="Chu kỳ:"
                                    value={item.cycleName}
                                    bottomSheetTitle="Chi tiết chu kỳ"
                                />
                                <DetailRow
                                    label="Kích cỡ (Size):"
                                    value={item.shrimpCountPerKg}
                                    unit="con/kg"
                                />
                                <DetailRow
                                    label="Ngày nuôi (DOC):"
                                    value={item.doc || 0}
                                    unit="ngày"
                                />
                                <DetailRow
                                    label="Đơn giá:"
                                    value={formatCurrencyValue(item.unitPrice)}
                                    unit="đ/kg"
                                />
                                <DetailRow
                                    label="Doanh thu (Tạm tính):"
                                    value={formatCurrencyValue(item.revenue)}
                                    unit="đ"
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: 8,
    },
    timelineColumn: {
        alignItems: 'center',
        width: 18,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.text,
        backgroundColor: colors.white,
        marginTop: 4,
    },
    timelineLine: {
        flex: 1,
        width: 1,
        backgroundColor: colors.text,
        marginTop: 2,
    },
    contentColumn: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        paddingRight: spacing.sm,
    },
    dateText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    topAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    topActionText: {
        fontSize: 14,
        color: colors.orange[600],
        fontWeight: '500',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cardTitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontFamily: typography.fontFamily.regular,
    },
    content: {
        gap: 6,
    },
    expandedContent: {
        gap: 6,
    },
});
