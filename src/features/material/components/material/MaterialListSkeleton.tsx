import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, borderRadius } from '@/styles';

const SKELETON_COUNT = 5;

interface SkeletonLineProps {
    width?: number | string;
    height: number;
    style?: any;
}

const SkeletonLine: React.FC<SkeletonLineProps> = ({ width = '100%', height, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            { resetBeforeIteration: true }
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    return (
        <View style={[styles.skeletonBase, { width, height }, style]}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const MaterialListSkeletonItem: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <SkeletonLine width="70%" height={20} style={styles.nameSkeleton} />
                <SkeletonLine width={80} height={24} style={styles.groupSkeleton} />
            </View>

            <View style={styles.separator} />

            {/* Basic Info Row */}
            <View style={styles.infoRow}>
                <SkeletonLine width={120} height={16} />
                <SkeletonLine width={100} height={16} />
            </View>

            {/* Expand Toggle Skeleton */}
            <View style={styles.expandToggle}>
                <SkeletonLine width={100} height={16} />
            </View>

            <View style={styles.separator} />

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
                <SkeletonLine width="48%" height={36} style={styles.buttonSkeleton} />
                <View style={styles.spacer} />
                <SkeletonLine width="48%" height={36} style={styles.buttonSkeleton} />
            </View>
        </View>
    );
};

export const MaterialListSkeleton: React.FC = () => {
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <MaterialListSkeletonItem key={index} />
            ))}
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
    skeletonBase: {
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
});
