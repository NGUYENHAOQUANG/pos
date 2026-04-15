import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const TrackingDaySkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.dayContainer}>
            {/* Timeline column */}
            <View style={styles.timelineColumn}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
            </View>

            {/* Content column */}
            <View style={styles.contentColumn}>
                {/* Date text */}
                <Skeleton
                    width={100}
                    height={20}
                    borderRadius={4}
                    style={{ marginBottom: spacing.sm }}
                />

                <View style={styles.activitiesContainer}>
                    {/* Activity 1 */}
                    <View style={styles.activityContainer}>
                        <Skeleton
                            width={60}
                            height={16}
                            borderRadius={4}
                            style={{ marginBottom: 8 }}
                        />
                        <View style={styles.card}>
                            {/* Header */}
                            <View style={styles.cardHeader}>
                                <Skeleton width="60%" height={20} borderRadius={4} />
                                <Skeleton width={20} height={20} borderRadius={10} />
                            </View>
                            <View style={styles.cardDivider} />
                            {/* Body */}
                            <View style={styles.cardBody}>
                                <View style={styles.dataRow}>
                                    <Skeleton width="40%" height={16} borderRadius={4} />
                                    <Skeleton width="30%" height={16} borderRadius={4} />
                                </View>
                                <View style={styles.dataRow}>
                                    <Skeleton width="50%" height={16} borderRadius={4} />
                                    <Skeleton width="20%" height={16} borderRadius={4} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Activity 2 */}
                    <View style={styles.activityContainer}>
                        <Skeleton
                            width={60}
                            height={16}
                            borderRadius={4}
                            style={{ marginBottom: 8 }}
                        />
                        <View style={styles.card}>
                            {/* Header */}
                            <View style={styles.cardHeader}>
                                <Skeleton width="70%" height={20} borderRadius={4} />
                                <Skeleton width={20} height={20} borderRadius={10} />
                            </View>
                            <View style={styles.cardDivider} />
                            {/* Body */}
                            <View style={styles.cardBody}>
                                <View style={styles.dataRow}>
                                    <Skeleton width="60%" height={16} borderRadius={4} />
                                    <Skeleton width="20%" height={16} borderRadius={4} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export const WorkLogSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <TrackingDaySkeleton />
            <TrackingDaySkeleton />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
        },
        dayContainer: {
            flexDirection: 'row',
        },
        timelineColumn: {
            width: 24,
            alignItems: 'center',
            marginRight: spacing.sm,
        },
        timelineDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            backgroundColor: theme.background,
            borderColor: theme.gray[300],
            marginTop: 4,
            zIndex: 1,
        },
        timelineLine: {
            flex: 1,
            width: 1,
            marginTop: 2,
            backgroundColor: theme.gray[100],
        },
        contentColumn: {
            flex: 1,
            paddingBottom: spacing.lg,
        },
        activitiesContainer: {
            gap: 16,
        },
        activityContainer: {
            flexDirection: 'column',
        },
        card: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: theme.backgroundTertiary,
        },
        cardDivider: {
            height: 1,
            backgroundColor: theme.borderLight,
        },
        cardBody: {
            paddingVertical: 12,
            paddingHorizontal: 12,
            gap: 16,
        },
        dataRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    });
