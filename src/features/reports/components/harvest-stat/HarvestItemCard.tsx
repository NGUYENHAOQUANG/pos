/**
 * @file HarvestItemCard.tsx
 * @description Card item hiển thị thống kê thu hoạch theo dạng timeline
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '@/styles';

import { HarvestStatsByPond } from '@/features/reports/types/harvest-stats';

interface Props {
    item: HarvestStatsByPond;
}

export const HarvestItemCard = ({ item }: Props) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => !prev);
    };

    const renderRow = (label: string, value: string | number, unit?: string) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.value}>{value}</Text>
                {unit ? <Text style={styles.valueUnit}>{unit}</Text> : null}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Timeline column */}
            <View style={styles.timelineColumn}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
            </View>

            {/* Content column */}
            <View style={styles.contentColumn}>
                {/* Top row: zoneName + Xem thêm */}
                <View style={styles.topRow}>
                    <Text style={styles.dateText}>{item.zoneName}</Text>
                    <TouchableOpacity
                        onPress={toggleExpand}
                        style={styles.topAction}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.topActionText}>
                            {expanded ? 'Thu gọn' : 'Xem thêm'}
                        </Text>
                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-forward'}
                            size={16}
                            color={colors.orange[600]}
                        />
                    </TouchableOpacity>
                </View>

                {/* Inner card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {item.pondName} ({item.pondCode})
                    </Text>

                    <View style={styles.content}>
                        {/* Thông tin chính */}
                        {renderRow('Tổng thu hoạch', item.totalHarvested, 'kg')}
                        {renderRow('Số lần thu', item.harvestCount, 'lần')}

                        {/* Thông tin chi tiết khi mở rộng */}
                        {expanded && (
                            <View style={styles.expandedContent}>
                                {renderRow(
                                    'Trung bình mỗi lần',
                                    Math.round(item.averageHarvestedPerTime),
                                    'kg/lần'
                                )}
                                {renderRow('Nhiều nhất (1 lần)', item.maxHarvestedInOneTime, 'kg')}
                                {renderRow('Ít nhất (1 lần)', item.minHarvestedInOneTime, 'kg')}
                                {renderRow(
                                    'Chiếm tỉ lệ',
                                    `${item.percentageOfTotalHarvest.toFixed(1)}%`
                                )}
                                {renderRow('Tồn kho hiện tại', item.remainingStock, 'con')}
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
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'right',
    },
    valueUnit: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
