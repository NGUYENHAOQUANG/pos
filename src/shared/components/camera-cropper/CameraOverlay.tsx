/**
 * @file CameraOverlay.tsx
 * @description SVG-based dark mask with a square crop window cut-out,
 *              a top control bar (close + flash), and a guide-text footer.
 *
 * The SVG uses `viewBox="0 0 1080 1920"` with `preserveAspectRatio="xMidYMid slice"`
 * so the mask aligns pixel-perfectly with the vision-camera-cropper crop region.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';
import { FRAME_W, FRAME_H, SQUARE_LEFT_PCT, SQUARE_TOP_PCT, SQUARE_W } from '@/shared/constants';

// Absolute pixel coords inside the SVG coordinate system
const SQ_X = (SQUARE_LEFT_PCT / 100) * FRAME_W;
const SQ_Y = (SQUARE_TOP_PCT / 100) * FRAME_H;
const SQ_SIZE = (SQUARE_W / 100) * FRAME_W;

export interface CameraOverlayProps {
    paddingTop: number;
    isFlashOn: boolean;
    onClose: () => void;
    onToggleFlash: () => void;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
    paddingTop,
    isFlashOn,
    onClose,
    onToggleFlash,
}) => (
    <>
        {/* Dark mask with a square hole – coordinate space matches crop region */}
        <Svg
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
            preserveAspectRatio="xMidYMid slice"
            pointerEvents="box-none"
        >
            <Path
                fill={colors.cameraOverlay}
                fillRule="evenodd"
                d={`M0,0 H${FRAME_W} V${FRAME_H} H0 Z M${SQ_X},${SQ_Y} H${SQ_X + SQ_SIZE} V${
                    SQ_Y + SQ_SIZE
                } H${SQ_X} Z`}
            />
            <Rect
                x={SQ_X}
                y={SQ_Y}
                width={SQ_SIZE}
                height={SQ_SIZE}
                stroke={colors.white}
                strokeWidth={6}
                fill="none"
                rx={8}
            />
        </Svg>

        {/* Top bar: close (left) + flash toggle (right) */}
        <View style={[styles.topBar, { paddingTop: paddingTop + 8 }]}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onToggleFlash} activeOpacity={0.7}>
                <Ionicons name={isFlashOn ? 'flash' : 'flash-off'} size={24} color={colors.white} />
            </TouchableOpacity>
        </View>

        {/* Guide text pinned to the bottom of the camera area */}
        <View style={styles.guideContainer}>
            <Text style={styles.guideText}>
                Vui lòng đặt chậu tôm nằm gọn{'\n'}trong khung vuông
            </Text>
        </View>
    </>
);

const styles = StyleSheet.create({
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: colors.cameraOverlay,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cameraIconBg,
    },
    guideContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: colors.cameraOverlay,
    },
    guideText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 24,
        textShadowColor: colors.shadow,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
