import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BlurView } from '@react-native-community/blur';
import { colors, spacing, borderRadius } from '@/styles';
import { CameraData } from '@/features/control/data/camerasData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = spacing.md * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = CARD_WIDTH * 0.56; // ~16:9 aspect ratio

interface CameraCardProps {
    camera: CameraData;
    onPress: (camera: CameraData) => void;
}

/**
 * Camera card showing thumbnail with pond name + camera name overlay.
 * Tapping navigates to full-screen video player.
 */
export const CameraCard: React.FC<CameraCardProps> = ({ camera, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress(camera)}
            style={styles.container}
        >
            {/* Thumbnail Image */}
            <Image source={camera.thumbnail} style={styles.thumbnail} resizeMode="cover" />

            {/* Gradient overlay at bottom */}
            <View style={styles.gradientOverlay} />

            {/* Labels overlay at bottom-left */}
            <View style={styles.labelsContainer}>
                <View style={styles.badgeWrapper}>
                    <BlurView blurType="dark" blurAmount={24} style={styles.blurView} />
                    <View style={styles.badgeContent}>
                        <Text style={styles.labelText}>{camera.pondName}</Text>
                    </View>
                </View>
                <View style={styles.badgeWrapper}>
                    <BlurView blurType="dark" blurAmount={24} style={styles.blurView} />
                    <View style={styles.badgeContent}>
                        <Text style={styles.labelText}>{camera.cameraName}</Text>
                    </View>
                </View>
            </View>

            {/* Online/Offline indicator */}
            {!camera.isOnline && (
                <View style={styles.offlineBadge}>
                    <View style={styles.offlineDot} />
                    <Text style={styles.offlineText}>Ngoại tuyến</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.sm,
        alignSelf: 'center',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'transparent',
        // Simulate gradient with semi-transparent overlay
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
    },
    labelsContainer: {
        position: 'absolute',
        bottom: spacing.sm + 2,
        left: spacing.sm + 2,
        flexDirection: 'row',
        gap: 8,
    },
    badgeWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
    },
    badgeContent: {
        backgroundColor: colors.overlayBadge,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    labelText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    offlineBadge: {
        position: 'absolute',
        top: spacing.sm + 2,
        right: spacing.sm + 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.overlayBadge,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        gap: 5,
    },
    offlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.red[500],
    },
    offlineText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
});
