import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BlurView } from '@react-native-community/blur';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing, borderRadius } from '@/styles';
import { CameraItem } from '@/features/control/api/cameraApi';
import { useCameraStream } from '@/features/control/hooks/useCameras';
import RNFS from 'react-native-fs';
import { downloadWithDigestAuth } from '@/shared/utils/digestAuthFetch';
import VideoPlayerBg from '@/assets/Icon/IconDevices/VideoPlayer.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = spacing.md * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = CARD_WIDTH * 0.56; // ~16:9 aspect ratio

// Snapshot auto-refresh interval (ms)
const SNAPSHOT_REFRESH_INTERVAL = 60000;

// Cache directory for snapshots
const SNAPSHOT_CACHE_DIR = `${RNFS.CachesDirectoryPath}/camera_snapshots`;

/**
 * Parse RTSP URL to build HTTP snapshot URL with embedded credentials for Dahua cameras.
 * RTSP format: rtsp://user:pass@host:port/cam/realmonitor?channel=1&subtype=1
 * Snapshot: http://user:pass@host/cgi-bin/snapshot.cgi?channel=1
 */
const getSnapshotUrl = (rtspUrl: string): string | null => {
    try {
        const match = rtspUrl.match(/rtsp:\/\/([^@]+)@([^:/]+)/i);
        if (!match) return null;

        const credentials = match[1]; // user:pass
        const host = match[2]; // IP address

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
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);

    const snapshotUrl = streamData?.url ? getSnapshotUrl(streamData.url) : null;

    // Download snapshot using Digest Auth
    const downloadSnapshot = useCallback(async () => {
        if (!snapshotUrl || !isOnline) return;

        try {
            // Ensure cache directory exists
            const dirExists = await RNFS.exists(SNAPSHOT_CACHE_DIR);
            if (!dirExists) {
                await RNFS.mkdir(SNAPSHOT_CACHE_DIR);
            }

            const filePath = `${SNAPSHOT_CACHE_DIR}/${camera.deviceSn}.jpg`;

            // Download via Digest Auth
            const success = await downloadWithDigestAuth(snapshotUrl, filePath);

            if (!isMountedRef.current) return;

            if (success) {
                // Force Image re-render with cache-busting timestamp
                setLocalImageUri(`file://${filePath}?t=${Date.now()}`);
                setIsLoading(false);
                setHasError(false);
            } else {
                setIsLoading(false);
                setHasError(true);
            }
        } catch {
            if (!isMountedRef.current) return;
            setIsLoading(false);
            setHasError(true);
        }
    }, [snapshotUrl, isOnline, camera.deviceSn]);

    // Initial download when snapshot URL becomes available
    useEffect(() => {
        if (snapshotUrl && isOnline) {
            setIsLoading(true);
            downloadSnapshot();
        }
    }, [snapshotUrl, isOnline, downloadSnapshot]);

    // Auto-refresh snapshot periodically
    useEffect(() => {
        if (!snapshotUrl || !isOnline) return;

        intervalRef.current = setInterval(() => {
            downloadSnapshot();
        }, SNAPSHOT_REFRESH_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [snapshotUrl, isOnline, downloadSnapshot]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Determine what to show
    const showSnapshot = localImageUri && isOnline && !hasError;
    const showSkeleton = isOnline && isLoading && !hasError;

    return (
        <TouchableOpacity
            activeOpacity={isOnline ? 0.85 : 1}
            onPress={() => {
                if (isOnline) onPress(camera);
            }}
            style={styles.container}
            disabled={!isOnline}
        >
            {/* Snapshot preview / Skeleton / Placeholder */}
            {showSnapshot ? (
                <Image source={{ uri: localImageUri }} style={styles.snapshot} resizeMode="cover" />
            ) : showSkeleton ? (
                <Skeleton width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={0} />
            ) : (
                <View style={styles.placeholderBg}>
                    {/* VideoPlayer SVG as full background */}
                    <VideoPlayerBg
                        width={CARD_WIDTH}
                        height={CARD_HEIGHT}
                        preserveAspectRatio="xMidYMid slice"
                    />
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
            )}

            {/* Labels overlay at bottom-left (only on snapshot view) */}
            {showSnapshot && (
                <View style={styles.labelsContainer}>
                    <View style={styles.badgeWrapper}>
                        <BlurView blurType="dark" blurAmount={24} style={styles.blurView} />
                        <View style={styles.badgeContent}>
                            <Text style={styles.labelText}>{camera.deviceSn}</Text>
                        </View>
                    </View>
                    <View style={styles.badgeWrapper}>
                        <BlurView blurType="dark" blurAmount={24} style={styles.blurView} />
                        <View style={styles.badgeContent}>
                            <Text style={styles.labelText}>{camera.name}</Text>
                        </View>
                    </View>
                </View>
            )}

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
    snapshot: {
        width: '100%',
        height: '100%',
    },
    placeholderBg: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.gray[200],
        overflow: 'hidden',
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
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
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
