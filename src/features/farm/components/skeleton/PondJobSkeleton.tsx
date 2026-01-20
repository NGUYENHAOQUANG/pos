import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing } from '@/styles';

const SKELETON_COUNT = 6;

const JobCardSkeleton: React.FC = () => {
    return (
        <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.leftContent}>
                    {/* Icon Skeleton */}
                    <Skeleton
                        width={40}
                        height={40}
                        borderRadius={20}
                        style={styles.iconSkeleton}
                    />
                    <View style={styles.titleContainer}>
                        {/* Title Skeleton */}
                        <Skeleton width="60%" height={20} borderRadius={4} />
                    </View>
                </View>
                {/* Action Button Skeleton */}
                <View style={styles.actions}>
                    <Skeleton width={32} height={32} borderRadius={4} />
                    <View style={{ width: 16, height: 16 }} />
                </View>
            </View>

            <View style={styles.divider} />

            {/* Body */}
            <View style={styles.body}>
                {/* Empty State Text Skeleton */}
                <Skeleton width={120} height={14} borderRadius={4} />
            </View>
        </View>
    );
};

export const PondJobSkeleton: React.FC = () => {
    // Mimic JobListCard structure
    return (
        <View style={styles.container}>
            {/* Date Header Skeleton */}
            <View style={styles.dateHeader}>
                <Skeleton width={150} height={20} borderRadius={4} />
            </View>
            <View style={styles.headerDivider} />

            <View style={styles.listContainer}>
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <JobCardSkeleton key={index} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
    },
    dateHeader: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
        width: '100%',
    },
    listContainer: {
        padding: spacing.md,
    },
    // Card Styles
    cardContainer: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: colors.borderDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconSkeleton: {
        marginRight: 12,
    },
    titleContainer: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        alignItems: 'center', // Center content like "Chưa có dữ liệu"
    },
});
