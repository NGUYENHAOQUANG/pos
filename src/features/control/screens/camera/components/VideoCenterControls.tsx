import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { IconSkipBack, IconSkipForward } from '@/assets/icons';

interface VideoCenterControlsProps {
    /** Whether the video is currently paused */
    paused: boolean;
    /** Whether the stream is a live RTSP stream (hides seek buttons) */
    isLiveStream: boolean;
    /** Toggle play/pause */
    onTogglePause: () => void;
    /** Seek backward */
    onSeekBack: () => void;
    /** Seek forward */
    onSeekForward: () => void;
}

/**
 * Center controls overlay with skip back, play/pause, skip forward buttons.
 * Seek buttons are hidden for live streams.
 */
export const VideoCenterControls: React.FC<VideoCenterControlsProps> = ({
    paused,
    isLiveStream,
    onTogglePause,
    onSeekBack,
    onSeekForward,
}) => (
    <View style={styles.centerControls} pointerEvents="box-none">
        {!isLiveStream && (
            <TouchableOpacity onPress={onSeekBack} style={styles.seekButton}>
                <IconSkipBack width={32} height={32} />
            </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onTogglePause} style={styles.playPauseButton}>
            {paused ? (
                <View style={styles.playIcon} />
            ) : (
                <View style={styles.pauseIconRow}>
                    <View style={styles.pauseBar} />
                    <View style={styles.pauseBar} />
                </View>
            )}
        </TouchableOpacity>

        {!isLiveStream && (
            <TouchableOpacity onPress={onSeekForward} style={styles.seekButton}>
                <IconSkipForward width={32} height={32} />
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    centerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
    },
    seekButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        width: 0,
        height: 0,
        borderLeftWidth: 18,
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderLeftColor: colors.white,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginLeft: 4,
    },
    pauseIconRow: {
        flexDirection: 'row',
        gap: 5,
    },
    pauseBar: {
        width: 5,
        height: 22,
        backgroundColor: colors.white,
        borderRadius: 2,
    },
});
