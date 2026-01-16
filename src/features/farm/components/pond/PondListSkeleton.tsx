import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';

const SKELETON_COUNT = 3;

const PondListSkeletonItem: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Header: Icon + Name + Tag + Menu */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Skeleton width={40} height={40} style={{ borderRadius: borderRadius.full }} />
                    <View style={styles.titleContainer}>
                        <Skeleton width={80} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={14} />
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Skeleton width={60} height={24} style={{ borderRadius: 4, marginRight: 8 }} />
                    <Skeleton width={24} height={24} style={{ borderRadius: 4 }} />
                </View>
            </View>

            {/* Status Button (Green/Orange pill) */}
            <View style={styles.statusRow}>
                <Skeleton width={120} height={32} style={{ borderRadius: borderRadius.full }} />
            </View>

            <View style={styles.separator} />

            {/* Info Box */}
            <View style={styles.infoBox}>
                {/* Activity Log Header */}
                <View style={styles.activityHeader}>
                    <Skeleton width={100} height={16} style={{ marginBottom: 4 }} />
                    <Skeleton width={140} height={14} />
                </View>

                {/* Info Rows */}
                <View style={styles.infoRow}>
                    <Skeleton width={120} height={16} />
                    <Skeleton width={40} height={16} />
                </View>
                <View style={styles.infoRow}>
                    <Skeleton width={120} height={16} />
                    <Skeleton width={60} height={16} />
                </View>
                <View style={styles.infoRow}>
                    <Skeleton width={80} height={16} />
                    <Skeleton width={150} height={16} />
                </View>
            </View>

            {/* Footer Button */}
            <View style={styles.footer}>
                <Skeleton width="100%" height={40} style={{ borderRadius: borderRadius.md }} />
            </View>
        </View>
    );
};

export const PondListSkeleton: React.FC = () => {
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <PondListSkeletonItem key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        padding: spacing.md,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: spacing.sm,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusRow: {
        marginBottom: spacing.md,
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
        marginBottom: spacing.md,
    },
    infoBox: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    activityHeader: {
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    footer: {
        marginTop: spacing.xs,
    },
});
