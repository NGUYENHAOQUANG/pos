import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';

const SKELETON_COUNT = 10;

const SeasonListSkeletonItem = () => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
                {/* Top Row: Title + Tag */}
                <View style={styles.topRow}>
                    <Skeleton width={150} height={20} style={{ marginRight: 8 }} />
                    <Skeleton width={80} height={20} style={{ borderRadius: 4 }} />
                </View>
                {/* Bottom Row: Date Range */}
                <View style={styles.bottomRow}>
                    <Skeleton width={200} height={16} />
                </View>
            </View>

            {/* Right Side: Edit Button */}
            <View style={styles.actionContainer}>
                <Skeleton width={32} height={32} style={{ borderRadius: borderRadius.sm }} />
            </View>
        </View>
    );
};

export const SeasonListSkeleton = () => {
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SeasonListSkeletonItem key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingTop: spacing.xs,
    },
    cardContainer: {
        backgroundColor: colors.white,
        padding: spacing.sm,
        marginTop: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        marginRight: spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    bottomRow: {
        marginTop: 4,
    },
    actionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
