import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography } from '@/styles';
import ChevronRight from '@/assets/Icon/ChevronRight.svg';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { CycleData } from '@/features/farm/types/cycle.types';
import { Tag } from './Tag';

interface CycleCardProps {
    cycle: CycleData;
    breedName?: string;
    endDate?: string;
    status?: 'Chưa hoàn thành' | 'Hoàn thành';
    onPress?: () => void;
}

export const CycleCard: React.FC<CycleCardProps> = ({
    cycle,
    breedName,
    endDate,
    status = 'Chưa hoàn thành',
    onPress,
}) => {
    if (!cycle) return null;

    const isCompleted = status === 'Hoàn thành';
    const cycleName = cycle.name || 'Chưa đặt tên';

    const stockingDateStr = cycle.createdAt;
    const startDate = stockingDateStr ? formatDate(new Date(stockingDateStr)) : '';
    const dateDisplay = endDate
        ? `${startDate} - ${endDate}`
        : startDate
        ? `${startDate} - nay`
        : '- nay';

    const doc = pondDetailService.calculateDOC(stockingDateStr ?? '');
    const stockingQuantity = cycle.totalStocking;
    const breed = breedName || '--';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.leftColumn}>
                    <Text style={styles.cycleName}>{cycleName}</Text>
                    <Text style={styles.dateText}>{dateDisplay}</Text>
                </View>

                <View style={styles.rightColumn}>
                    <Tag
                        status={isCompleted ? 'active' : 'preparing'}
                        label={status}
                        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    />
                    <ChevronRight width={18} height={18} style={styles.arrowIcon} />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.body}>
                <View style={styles.row}>
                    <Text style={styles.label}>Ngày nuôi (DOC):</Text>
                    <Text style={styles.value}>{doc}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Số lượng thả (Pls):</Text>
                    <Text style={styles.value}>
                        {typeof stockingQuantity === 'number'
                            ? stockingQuantity.toLocaleString()
                            : '-'}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Tôm giống:</Text>
                    <Text style={styles.value}>{breed}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        alignItems: 'center',
    },
    leftColumn: {
        flex: 1,
    },
    cycleName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
        lineHeight: 22,
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    rightColumn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    arrowIcon: {
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    body: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
    },
    value: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
});
