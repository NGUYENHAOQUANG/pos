import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BlurView } from '@react-native-community/blur';
import { colors, spacing, borderRadius } from '@/styles';
import { CameraItem } from '@/features/control/api/cameraApi';
import { useCameraStream } from '@/features/control/hooks/useCameras';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = spacing.md * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = CARD_WIDTH * 0.56; // ~16:9 aspect ratio

// Snapshot auto-refresh interval (ms)
const SNAPSHOT_REFRESH_INTERVAL = 10000;

/**
 * Parse RTSP URL to build HTTP snapshot URL for Dahua cameras.
 * RTSP format: rtsp://user:pass@host:port/cam/realmonitor?channel=1&subtype=1
 * Snapshot format: http://user:pass@host/cgi-bin/snapshot.cgi?channel=1
 */
const getSnapshotUrl = (rtspUrl: string): string | null => {
    try {
        // Extract credentials and host from RTSP URL
        const match = rtspUrl.match(/rtsp:\/\/([^@]+)@([^:/]+)/i);
        if (!match) return null;

        const credentials = match[1]; // user:pass
        const host = match[2]; // IP address

        // Extract channel from query params (default to 1)
        const channelMatch = rtspUrl.match(/channel=(\d+)/);
        const channel = channelMatch ? channelMatch[1] : '1';

        return `http://${credentials}@${host}/cgi-bin/snapshot.cgi?channel=${channel}`;
    } catch {
        return null;
    }
};

interface CameraCardProps {
    camera: CameraItem;
    onPress: (camera: CameraItem) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onPress }) => {
    const isOnline = camera.status === 'Online';
    const { data: streamData } = useCameraStream(camera.deviceSn);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    // Append timestamp to URL to force refresh (bypass cache)
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const snapshotUrl = streamData?.url ? getSnapshotUrl(streamData.url) : null;

    // Auto-refresh snapshot periodically
    useEffect(() => {
        if (!snapshotUrl || !isOnline) return;

        intervalRef.current = setInterval(() => {
            setRefreshKey(Date.now());
        }, SNAPSHOT_REFRESH_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [snapshotUrl, isOnline]);

    const handleLoadEnd = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    const handleError = useCallback(() => {
        setIsLoading(false);
        setHasError(true);
    }, []);

    // Build image URI with cache-busting timestamp
    const imageUri = snapshotUrl ? `${snapshotUrl}&t=${refreshKey}` : null;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress(camera)}
            style={styles.container}
        >
            {/* Snapshot preview or placeholder */}
            {imageUri && isOnline ? (
                <View style={styles.streamContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.snapshot}
                        resizeMode="cover"
                        onLoadEnd={handleLoadEnd}
                        onError={handleError}
                    />
                    {isLoading && (
                        <View style={styles.bufferingOverlay}>
                            <ActivityIndicator size="small" color={colors.white} />
                        </View>
                    )}
                    {hasError && (
                        <View style={styles.placeholderBg}>
                            <Text style={styles.snText}>{camera.deviceSn}</Text>
                            <Text style={styles.modelText}>Không thể tải ảnh</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.placeholderBg}>
                    <Text style={styles.snText}>{camera.deviceSn}</Text>
                    <Text style={styles.modelText}>{camera.modelCode}</Text>
                </View>
            )}

            {/* Labels overlay at bottom-left */}
            <View style={styles.labelsContainer}>
                <View style={styles.badgeWrapper}>
                    <BlurView blurType="dark" blurAmount={24} style={styles.blurView} />
                    <View style={styles.badgeContent}>
                        <Text style={styles.labelText}>{camera.name}</Text>
                    </View>
                </View>
            </View>

            {/* Online/Offline indicator */}
            <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
                <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
                <Text style={styles.statusText}>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
            </View>
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
    streamContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.gray[800],
    },
    snapshot: {
        width: '100%',
        height: '100%',
    },
    bufferingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    placeholderBg: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.gray[800],
        justifyContent: 'center',
        alignItems: 'center',
    },
    snText: {
        color: colors.gray[400],
        fontSize: 12,
        fontWeight: '500',
    },
    modelText: {
        color: colors.gray[500],
        fontSize: 10,
        marginTop: 4,
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
    onlineBadge: {
        backgroundColor: colors.overlayBadge,
    },
    offlineBadge: {
        backgroundColor: colors.overlayBadge,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    onlineDot: {
        backgroundColor: colors.green[500],
    },
    offlineDot: {
        backgroundColor: colors.red[500],
    },
    statusText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
});
