import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { colors, Colors } from '@/styles/colors';
import { CameraItem } from '@/features/control/api/cameraApi';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = spacing.md * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = CARD_WIDTH * 0.56; // ~16:9 aspect ratio

interface CameraCardProps {
    camera: CameraItem;
    onPress: (camera: CameraItem) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onPress }) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const isOnline = camera.status === 'On';
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const getStatusProps = () => {
        switch (camera.status) {
            case 'On':
                return { text: 'Trực tuyến', dotStyle: themedStyles.onlineDot };
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
    const hasSnapshot = !!camera.snapshotUrl;

    // Show skeleton while snapshot is loading
    if (hasSnapshot && !isImageLoaded) {
        return (
            <View style={styles.container}>
                {/* Skeleton placeholder while image loads */}
                <Skeleton width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={borderRadius.md} />

                {/* Badge skeletons at bottom-left */}
                <View style={styles.placeholderBadgesRow}>
                    <Skeleton
                        width={120}
                        height={28}
                        borderRadius={20}
                        backgroundColor={theme.gray[300]}
                    />
                    <Skeleton
                        width={150}
                        height={28}
                        borderRadius={20}
                        backgroundColor={theme.gray[300]}
                    />
                </View>

                {/* Hidden image to trigger onLoad */}
                <Image
                    source={{ uri: camera.snapshotUrl! }}
                    style={styles.hiddenImage}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setIsImageLoaded(true)}
                />
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={!isOnline}
            onPress={() => onPress(camera)}
            style={styles.container}
        >
            {/* Snapshot preview or placeholder background */}
            <View style={themedStyles.placeholderBg}>
                {hasSnapshot ? (
                    // Snapshot image from server
                    <Image
                        source={{ uri: camera.snapshotUrl! }}
                        style={styles.snapshotImage}
                        resizeMode="cover"
                    />
                ) : (
                    // Fallback placeholder SVG (no snapshot available)
                    <VideoPlayerBg
                        width={CARD_WIDTH}
                        height={CARD_HEIGHT}
                        preserveAspectRatio="xMidYMid slice"
                        color={theme.isDark ? theme.border : colors.gray[300]}
                    />
                )}

                {/* Camera code + camera name badges */}
                <View style={styles.placeholderBadgesRow}>
                    <View style={styles.placeholderBadge}>
                        <Text style={styles.placeholderBadgeText}>{camera.deviceSn}</Text>
                    </View>
                    <View style={styles.placeholderBadge}>
                        <Text style={styles.placeholderBadgeText}>{camera.name}</Text>
                    </View>
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
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.sm,
        alignSelf: 'center',
    },
    snapshotImage: {
        width: '100%',
        height: '100%',
    },
    hiddenImage: {
        width: 0,
        height: 0,
        position: 'absolute',
    },
    placeholderBadgesRow: {
        position: 'absolute',
        bottom: spacing.sm + 2,
        left: spacing.sm + 2,
        flexDirection: 'row',
        gap: 8,
    },
    placeholderBadge: {
        backgroundColor: 'rgba(102, 112, 133, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    placeholderBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
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
