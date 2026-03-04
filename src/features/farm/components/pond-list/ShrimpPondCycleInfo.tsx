import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { CycleData } from '@/features/farm/types/farm.types';

interface ShrimpPondCycleInfoProps {
    cycleData: CycleData;
    doc: number;
    breedLabel?: string;
}

export const ShrimpPondCycleInfo: React.FC<ShrimpPondCycleInfoProps> = ({
    cycleData,
    doc,
    breedLabel,
}) => {
    if (!cycleData || cycleData.status === 'Hoàn thành') {
        return null;
    }

    return (
        <View style={styles.cycleSection}>
            <View style={styles.cycleHeader}>
                <Text style={styles.cycleName}>
                    {cycleData.name || cycleData.cycleName || 'Chưa đặt tên'}
                </Text>
                <Text style={styles.cycleDate}>
                    {cycleData.stockingDate || cycleData.startDate
                        ? `${formatDate(
                              new Date((cycleData.stockingDate || cycleData.startDate) as string)
                          )} - nay`
                        : '- - nay'}
                </Text>
            </View>
            <View style={styles.cycleInfo}>
                <View style={styles.cycleInfoRow}>
                    <Text style={styles.cycleLabel}>Số ngày nuôi (DOC):</Text>
                    <Text style={styles.cycleValue}>{doc}</Text>
                </View>
                <View style={styles.cycleInfoRow}>
                    <Text style={styles.cycleLabel}>Số lượng thả (Pls):</Text>
                    <Text style={styles.cycleValue}>
                        {cycleData.totalStocking?.toLocaleString('vi-VN')}
                    </Text>
                </View>
                <View style={styles.cycleInfoRow}>
                    <Text style={styles.cycleLabel}>Tôm giống:</Text>
                    <Text style={styles.cycleValue}>{breedLabel || '-'}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cycleSection: {
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.md,
        marginBottom: 12,
    },
    cycleHeader: {
        backgroundColor: colors.geekblue[100],
        padding: spacing.sm,
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
    },
    cycleName: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cycleDate: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    cycleInfo: {
        gap: spacing.xs,
        padding: spacing.sm,
    },
    cycleInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cycleLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        flex: 1,
        fontWeight: typography.fontWeight.bold,
        lineHeight: 22,
    },
    cycleValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
});
