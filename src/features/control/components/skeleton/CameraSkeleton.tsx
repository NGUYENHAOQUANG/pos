import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = spacing.md * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = CARD_WIDTH * 0.56; // ~16:9 aspect ratio (matching CameraCard)
const SKELETON_COUNT = 3;

/**
 * Skeleton for a single Camera Card (matching CameraCard layout).
 * Shows a 16:9 card with 2 badge skeletons at bottom-left.
 */
const CameraCardSkeletonItem = () => {
    return (
        <View style={styles.card}>
            {/* Thumbnail area */}
            <Skeleton width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={borderRadius.md} />

            {/* Badge skeletons at bottom-left (overlay position) */}
            <View style={styles.labelsContainer}>
                <Skeleton
                    width={70}
                    height={28}
                    borderRadius={20}
                    backgroundColor={colors.gray[300]}
                />
                <Skeleton
                    width={90}
                    height={28}
                    borderRadius={20}
                    backgroundColor={colors.gray[300]}
                />
            </View>
        </View>
    );
};

/**
 * Skeleton loading state for the Camera list tab.
 */
export const CameraSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <CameraCardSkeletonItem key={index} />
            ))}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.sm,
        alignSelf: 'center',
    },
    labelsContainer: {
        position: 'absolute',
        bottom: spacing.sm + 2,
        left: spacing.sm + 2,
        flexDirection: 'row',
        gap: 8,
    },
});
