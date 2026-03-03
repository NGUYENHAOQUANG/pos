import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';

interface CycleCardProps {
    cycle: any;
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
    const cycleName = cycle.cycleName || cycle.name || 'Chưa đặt tên';

    const stockingDateStr = cycle.stockingDate || cycle.startDate;
    const startDate = stockingDateStr ? formatDate(new Date(stockingDateStr)) : '';
    const dateDisplay = endDate
        ? `${startDate} - ${endDate}`
        : startDate
        ? `${startDate} - nay`
        : '- nay';

    const doc =
        cycle.doc !== undefined ? cycle.doc : pondDetailService.calculateDOC(stockingDateStr ?? '');
    const stockingQuantity = cycle.stockingQuantity ?? cycle.totalStocking ?? 0;
    const breed = breedName || cycle.breedName || cycle.breedSource || '-';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            {/* Header chia làm 2 cột */}
            <View style={styles.header}>
                {/* Cột trái: Tên và Ngày thả */}
                <View style={styles.leftColumn}>
                    <Text style={styles.cycleName}>{cycleName}</Text>
                    <Text style={styles.dateText}>{dateDisplay}</Text>
                </View>

                {/* Cột phải: Badge trạng thái & Mũi tên */}
                <View style={styles.rightColumn}>
                    <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
                        <Text
                            style={[styles.statusText, isCompleted && styles.statusTextCompleted]}
                        >
                            {status}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.gray[400]}
                        style={styles.arrowIcon}
                    />
                </View>
            </View>

            {/* Borderline tách biệt Header và Body */}
            <View style={styles.divider} />

            {/* Body: Thông tin chi tiết */}
            <View style={styles.body}>
                <View style={styles.row}>
                    <Text style={styles.label}>Ngày nuôi (DOC):</Text>
                    <Text style={styles.value}>{doc}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Số lượng thả (Pls):</Text>
                    <Text style={styles.value}>{stockingQuantity.toLocaleString()}</Text>
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
        borderColor: colors.borderLight,
        borderRadius: 0,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
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
    statusBadge: {
        backgroundColor: colors.yellow[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.yellow[300],
    },
    statusBadgeCompleted: {
        backgroundColor: colors.neutral,
        borderColor: colors.defaultBorder,
    },
    statusText: {
        fontSize: typography.fontSize.sm,
        color: colors.orange[500],
        fontWeight: typography.fontWeight.regular,
    },
    statusTextCompleted: {
        color: colors.text,
    },
    arrowIcon: {
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
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
});
