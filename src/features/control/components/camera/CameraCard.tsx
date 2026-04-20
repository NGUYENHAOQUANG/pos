import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { colors, Colors } from '@/styles/colors';
import { CameraItem } from '@/features/control/api/cameraApi';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';
import { RTCView } from 'react-native-webrtc';
import { useWebRTCStream } from '@/features/control/screens/camera/hooks/useWebRTCStream';
import { useIsFocused } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16; // spacing.md on each side
const GRID_GAP = 8; // gap between two columns
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const GRID_CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2);

interface CameraCardProps {
    camera: CameraItem;
    onPress: (camera: CameraItem) => void;
    isGrid?: boolean;
    /** Whether the card is currently visible in the viewport. Controls WebRTC connection lifecycle. */
    isVisible?: boolean;
}

export const CameraCard: React.FC<CameraCardProps> = ({
    camera,
    onPress,
    isGrid,
    isVisible = true,
}) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const isOnline = camera.status === 'On';
    const isFocused = useIsFocused();

    // Only attempt WebRTC if online, URL exists, screen is focused, AND card is visible
    const shouldFetchWebRTC = isOnline && !!camera.liveUrl && isFocused && isVisible;
    // Disable audio for card previews to reduce CPU/bandwidth
    const { stream, isConnected } = useWebRTCStream(shouldFetchWebRTC ? camera.liveUrl! : '', {
        enableAudio: false,
    });

    const adjustedWidth = isGrid ? GRID_CARD_WIDTH : CARD_WIDTH;
    const adjustedHeight = adjustedWidth * (9 / 16);

    const dynamicContainerStyle = {
        width: adjustedWidth,
        height: adjustedHeight,
        marginBottom: isGrid ? 0 : spacing.sm,
    };

    const getStatusProps = () => {
        switch (camera.status) {
            case 'On':
                return { text: 'Online', dotStyle: themedStyles.onlineDot };
            case 'Off':
                return { text: 'Offline', dotStyle: themedStyles.offlineDot };
            case 'Fault':
                return { text: 'Kết nối thất bại', dotStyle: themedStyles.faultDot };
            case 'Connecting':
                return { text: 'Đang kết nối', dotStyle: themedStyles.connectingDot };
            default:
                return { text: camera.status || 'Offline', dotStyle: themedStyles.offlineDot };
        }
    };

    const statusProps = getStatusProps();
    const hasLiveUrl = !!camera.liveUrl;

    // Show skeleton while connecting to WebRTC stream
    if (hasLiveUrl && isOnline && !isConnected) {
        const skeletonColor = theme.isDark ? theme.background : theme.gray[200];

        return (
            <View style={[styles.container, dynamicContainerStyle]}>
                {/* Skeleton placeholder while stream connects */}
                <Skeleton
                    width={adjustedWidth}
                    height={adjustedHeight}
                    borderRadius={borderRadius.md}
                    backgroundColor={skeletonColor}
                />

                {/* Badge skeletons at bottom-left */}
                <View style={styles.placeholderBadgesRow}>
                    <Skeleton
                        width={120}
                        height={16}
                        borderRadius={4}
                        backgroundColor={skeletonColor}
                    />
                    <Skeleton
                        width={150}
                        height={16}
                        borderRadius={4}
                        backgroundColor={skeletonColor}
                    />
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={!isOnline}
            onPress={() => onPress(camera)}
            style={[styles.container, dynamicContainerStyle]}
        >
            {/* Live WebRTC preview or placeholder background */}
            <View style={themedStyles.placeholderBg}>
                {hasLiveUrl && stream ? (
                    // Live RTC view from stream
                    <RTCView
                        streamURL={stream.toURL()}
                        style={styles.snapshotImage}
                        objectFit="cover"
                        zOrder={0}
                    />
                ) : (
                    // Fallback placeholder SVG (no snapshot available)
                    <VideoPlayerBg
                        width={adjustedWidth}
                        height={adjustedHeight}
                        preserveAspectRatio="xMidYMid slice"
                        color={theme.isDark ? theme.border : colors.gray[300]}
                    />
                )}

                {/* Camera name and SN overlaid natively over image */}
                <View style={styles.placeholderBadgesRow}>
                    <Text style={styles.placeholderBadgeText} numberOfLines={1}>
                        {camera.deviceCode}
                    </Text>
                    <Text style={styles.placeholderBadgeText} numberOfLines={1}>
                        {camera.name}
                    </Text>
                </View>
            </View>

            {/* Online/Offline indicator */}
            <View style={[styles.statusBadge, styles.overlayBadge]}>
                <View style={[styles.statusDot, statusProps.dotStyle]} />
                <Text style={styles.statusText}>{statusProps.text}</Text>
            </View>
        </TouchableOpacity>
    );
};

// Static styles
const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    snapshotImage: {
        width: '100%',
        height: '100%',
    },
    placeholderBadgesRow: {
        position: 'absolute',
        bottom: spacing.sm,
        left: spacing.sm,
        right: spacing.sm,
        flexDirection: 'column',
        gap: 2,
    },
    placeholderBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.sm + 2,
        right: spacing.sm + 2,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        gap: 5,
    },
    overlayBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        placeholderBg: {
            width: '100%',
            height: '100%',
            backgroundColor: theme.backgroundSecondary,
            overflow: 'hidden',
        },
        onlineDot: {
            backgroundColor: theme.green[500],
        },
        offlineDot: {
            backgroundColor: theme.red[500],
        },
        faultDot: {
            backgroundColor: theme.orange[500],
        },
        connectingDot: {
            backgroundColor: theme.blue[400],
        },
    });
