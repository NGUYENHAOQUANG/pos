import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors } from '@/styles';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';

interface VideoTopBarProps {
    /** Pond name badge text */
    pondName: string;
    /** Camera name badge text */
    cameraName: string;
    /** Close/exit handler */
    onClose: () => void;
    /** Whether it is HD stream */
    isHd?: boolean;
    /** Camera ID (deviceCode) */
    deviceCode?: string;
}

/**
 * Top bar overlay for the video player.
 * Shows pond name + camera name badges on the left,
 * snapshot button + close button on the right.
 */
export const VideoTopBar: React.FC<VideoTopBarProps> = ({
    pondName,
    cameraName,
    onClose,
    isHd,
}) => (
    <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.badgesRow}>
            <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                    {pondName}
                </Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                    {cameraName}
                </Text>
            </View>
            {isHd !== undefined && (
                <View style={[styles.badge, styles.hdBadge]}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                        {isHd ? 'HD' : 'SD'}
                    </Text>
                </View>
            )}
        </View>
        <View style={styles.badgesRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon width={20} height={20} color={colors.white} />
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
        flexShrink: 1,
        paddingRight: 8,
    },
    badge: {
        backgroundColor: colors.overlayBadge,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexShrink: 1,
    },
    hdBadge: {
        backgroundColor: colors.overlayBadge, // Can be specialized if needed
    },
    badgeText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        backgroundColor: colors.overlayBadge,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
