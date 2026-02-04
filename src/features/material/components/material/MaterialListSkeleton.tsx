import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';

export const MaterialItemSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Skeleton width="70%" height={20} style={styles.nameSkeleton} />
                <Skeleton width={80} height={24} style={styles.groupSkeleton} />
            </View>

            <View style={styles.separator} />

            {/* Basic Info Row */}
            <View style={styles.infoRow}>
                <Skeleton width={120} height={16} />
                <Skeleton width={100} height={16} />
            </View>

            {/* Expand Toggle Skeleton */}
            <View style={styles.expandToggle}>
                <Skeleton width={100} height={16} />
            </View>

            <View style={styles.separator} />

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
                <Skeleton width="48%" height={36} style={styles.buttonSkeleton} />
                <View style={styles.spacer} />
                <Skeleton width="48%" height={36} style={styles.buttonSkeleton} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    nameSkeleton: {
        marginRight: spacing.sm,
    },
    groupSkeleton: {
        // width handled by SkeletonLine prop
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: spacing.sm,
    },
    expandToggle: {
        alignItems: 'center',
        marginVertical: spacing.sm,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },
    buttonSkeleton: {
        borderRadius: borderRadius.sm,
    },
    spacer: {
        width: spacing.md,
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
});
