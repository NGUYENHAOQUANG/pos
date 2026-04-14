import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md;
const GRID_GAP = 8;
const GRID_CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2);
const GRID_CARD_HEIGHT = GRID_CARD_WIDTH * 0.65;

/**
 * Skeleton loading state for the Camera list tab.
 * Matches CameraFilter (pills + stat cards) and the grouped CameraCard grid list.
 */
export const CameraSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const skeletonColor = theme.isDark ? theme.background : theme.gray[200];

    return (
        <View style={styles.container}>
            {/* Filter Pills Skeleton */}
            <View style={styles.pillsScrollWrapper}>
                <View style={styles.pillsContainer}>
                    {[1, 2, 3, 4].map(idx => (
                        <Skeleton
                            key={`pill-${idx}`}
                            width={80}
                            height={34}
                            borderRadius={8}
                            backgroundColor={skeletonColor}
                        />
                    ))}
                </View>
            </View>

            {/* Stat Cards Skeleton */}
            <View style={styles.statsScrollWrapper}>
                <View style={styles.statsContainer}>
                    {[1, 2, 3, 4].map(idx => (
                        <Skeleton
                            key={`stat-${idx}`}
                            width={84}
                            height={62}
                            borderRadius={12}
                            backgroundColor={skeletonColor}
                        />
                    ))}
                </View>
            </View>

            {/* Groups Skeleton */}
            {[1, 2].map(groupIdx => (
                <View key={`group-${groupIdx}`} style={styles.groupContainer}>
                    {/* Header */}
                    <View style={styles.groupHeader}>
                        <View>
                            <Skeleton
                                width={120}
                                height={20}
                                borderRadius={4}
                                backgroundColor={skeletonColor}
                            />
                            <View style={{ height: 4 }} />
                            <Skeleton
                                width={80}
                                height={14}
                                borderRadius={4}
                                backgroundColor={skeletonColor}
                            />
                        </View>
                        <Skeleton
                            width={60}
                            height={16}
                            borderRadius={4}
                            backgroundColor={skeletonColor}
                        />
                    </View>

                    {/* Grid of Camera Cards */}
                    <View style={styles.gridContainer}>
                        {[1, 2].map(idx => (
                            <Skeleton
                                key={`card-${idx}`}
                                width={GRID_CARD_WIDTH}
                                height={GRID_CARD_HEIGHT}
                                borderRadius={borderRadius.md}
                                backgroundColor={skeletonColor}
                            />
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pillsScrollWrapper: {
        marginBottom: 12,
        paddingTop: 10,
    },
    pillsContainer: {
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        gap: 6,
        overflow: 'hidden',
    },
    statsScrollWrapper: {
        marginBottom: 26,
    },
    statsContainer: {
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        gap: 10,
        overflow: 'hidden',
    },
    groupContainer: {
        marginBottom: 26,
        paddingHorizontal: spacing.md,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
