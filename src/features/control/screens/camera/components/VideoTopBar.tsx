import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors } from '@/styles';
import CameraIcon from '@/assets/Icon/IconFarm/camera.svg';

interface VideoTopBarProps {
    /** Pond name badge text */
    pondName: string;
    /** Camera name badge text */
    cameraName: string;
    /** Snapshot capture handler */
    onSnapshot: () => void;
    /** Close/exit handler */
    onClose: () => void;
}

/**
 * Top bar overlay for the video player.
 * Shows pond name + camera name badges on the left,
 * snapshot button + close button on the right.
 */
export const VideoTopBar: React.FC<VideoTopBarProps> = ({
    pondName,
    cameraName,
    onSnapshot,
    onClose,
}) => (
    <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.badgesRow}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{pondName}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{cameraName}</Text>
            </View>
        </View>
        <View style={styles.badgesRow}>
            <TouchableOpacity onPress={onSnapshot} style={styles.snapshotButton}>
                <CameraIcon width={20} height={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        backgroundColor: colors.overlayBadge,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    snapshotButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.overlayBadge,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        backgroundColor: colors.overlayBadge,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
