import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const VIDEO_HEIGHT = VIDEO_WIDTH * 0.56;

/**
 * Skeleton placeholder for camera video preview area in CameraDetailScreen.
 * Mirrors the video preview layout: shimmer background + badge placeholders + fullscreen button.
 */
export const CameraDetailSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const badgeColor = theme.isDark ? theme.gray[700] : theme.gray[300];

    return (
        <View style={styles.container}>
            {/* Full video area shimmer */}
            <Skeleton width={VIDEO_WIDTH} height={VIDEO_HEIGHT} borderRadius={0} />

            {/* Badge placeholders overlaid on top */}
            <View style={styles.badgesRow}>
                <Skeleton width={50} height={22} borderRadius={6} backgroundColor={badgeColor} />
                <Skeleton width={110} height={22} borderRadius={16} backgroundColor={badgeColor} />
                <Skeleton width={60} height={22} borderRadius={16} backgroundColor={badgeColor} />
            </View>

            {/* Fullscreen button placeholder */}
            <View style={styles.fullscreenPlaceholder}>
                <Skeleton width={40} height={40} borderRadius={20} backgroundColor={badgeColor} />
            </View>
        </View>
    );
};

const getStyles = (_theme: Colors) =>
    StyleSheet.create({
        container: {
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            borderRadius: 16,
            overflow: 'hidden',
        },
        badgesRow: {
            position: 'absolute',
            top: 15,
            left: 8,
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
        },
        fullscreenPlaceholder: {
            position: 'absolute',
            bottom: 12,
            right: 12,
        },
    });
