import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const SKELETON_COUNT = 10;

const SeasonListSkeletonItem = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
                {/* Tag */}
                <Skeleton width={80} height={20} style={styles.tagSkeleton} />
                {/* Name/Title */}
                <Skeleton width={150} height={20} style={styles.titleSkeleton} />
                {/* Date Range */}
                <Skeleton width={200} height={16} style={styles.dateSkeleton} />
            </View>

            {/* Right Side: Edit Button */}
            <View style={styles.actionContainer}>
                <Skeleton width={70} height={32} style={{ borderRadius: 100 }} />
            </View>
        </View>
    );
};

export const SeasonListSkeleton = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.listContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SeasonListSkeletonItem key={index} />
            ))}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        listContainer: {
            paddingTop: spacing.xs,
        },
        cardContainer: {
            backgroundColor: theme.background,
            padding: spacing.md,
            marginTop: spacing.sm,
            marginHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        contentContainer: {
            flex: 1,
            marginRight: spacing.md,
        },
        tagSkeleton: {
            marginBottom: 8,
            borderRadius: 12,
        },
        titleSkeleton: {
            marginBottom: 8,
        },
        dateSkeleton: {
            marginTop: 4,
        },
        actionContainer: {
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
