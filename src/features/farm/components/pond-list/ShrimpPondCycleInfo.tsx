import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { CyclePond } from '@/features/farm/types/pond.types';

interface ShrimpPondCycleInfoProps {
    cyclePond: CyclePond;
    doc: number;
    breedLabel?: string;
}

export const ShrimpPondCycleInfo: React.FC<ShrimpPondCycleInfoProps> = ({
    cyclePond,
    doc,
    breedLabel,
}) => {
    if (!cyclePond) {
        return null;
    }

    return (
        <View style={styles.cycleSection}>
            <View style={styles.cycleHeader}>
                <View style={styles.cycleNameWrapper}>
                    <Text style={styles.cycleName}>{cyclePond.cycleName || '---'}</Text>
                </View>
                <Text style={styles.cycleDate} numberOfLines={1}>
                    {cyclePond.createAt
                        ? `${formatDate(new Date(cyclePond.createAt))} - nay`
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
                        {cyclePond.record?.quantity?.toLocaleString('vi-VN')}
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
