import React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { LANDSCAPE_W } from '@/features/control/screens/camera/constants/videoPlayer.constants';

interface VideoBottomBarProps {
    /** Whether the stream is a live RTSP stream */
    isLiveStream: boolean;
    /** Current playback time in seconds */
    currentTime: number;
    /** Total video duration in seconds */
    duration: number;
    /** Progress percentage (0-100) */
    progress: number;
    /** Format seconds to MM:SS string */
    formatTime: (seconds: number) => string;
    /** Seek to a specific time */
    seekTo: (time: number) => void;
    /** Show controls and reset auto-hide timer */
    showControlsUI: () => void;
}

/**
 * Bottom bar overlay for the video player.
 * Shows LIVE badge for live streams, or time + progress bar for VOD.
 */
export const VideoBottomBar: React.FC<VideoBottomBarProps> = ({
    isLiveStream,
    currentTime,
    duration,
    progress,
    formatTime,
    seekTo,
    showControlsUI,
}) => {
    if (isLiveStream) {
        return (
            <View style={styles.bottomBar} pointerEvents="box-none">
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.bottomBar} pointerEvents="box-none">
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <TouchableWithoutFeedback
                onPress={e => {
                    const locationX = e.nativeEvent.locationX;
                    const barWidth = LANDSCAPE_W - 140;
                    const seekPercent = locationX / barWidth;
                    seekTo(seekPercent * duration);
                    showControlsUI();
                }}
            >
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        <View style={[styles.progressDot, { left: `${progress}%` }]} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 10,
    },
    timeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
        minWidth: 42,
        textAlign: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 30,
        justifyContent: 'center',
    },
    progressBarBackground: {
        height: 3,
        backgroundColor: colors.overlayLoading,
        borderRadius: 2,
        position: 'relative',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.white,
        borderRadius: 2,
    },
    progressDot: {
        position: 'absolute',
        top: -5,
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: colors.white,
        marginLeft: -6,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.red[500],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.white,
    },
    liveText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
});
