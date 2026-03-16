import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { CycleData } from '@/features/farm/types/cycle.types';

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
                <View style={styles.cycleNameWrapper}>
                    <Text style={styles.cycleName}>{cycleData.name || '---'}</Text>
                </View>
                <Text style={styles.cycleDate} numberOfLines={1}>
                    {cycleData.createdAt
                        ? `${formatDate(new Date(cycleData.createdAt))} - nay`
                        : '-- nay'}
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
                    <Text style={styles.cycleValue}>{breedLabel || 'N/A'}</Text>
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
        overflow: 'hidden',
    },
    cycleHeader: {
        backgroundColor: colors.gray[50],
        padding: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cycleNameWrapper: {
        flex: 1,
        marginRight: spacing.sm,
    },
    cycleName: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    cycleDate: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        flexShrink: 0,
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
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 22,
    },
    cycleValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
});
