/**
 * @file CropOverlay.tsx
 * @description Fixed square crop overlay with grid lines (rule of thirds).
 *
 * The overlay is rendered at a FIXED position (centred); the user moves/zooms
 * the image underneath it.  This component is purely visual – no gesture
 * handling of its own.
 *
 * Props:
 *   containerWidth  / containerHeight  → dimensions of the cropping viewport
 *   cropSize                           → side length of the square crop frame
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/styles';

const BORDER_WIDTH = 1.5;

export interface CropOverlayProps {
    containerWidth: number;
    containerHeight: number;
    /** Side length of the crop square (display pixels) */
    cropSize: number;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({
    containerWidth,
    containerHeight,
    cropSize,
}) => {
    const left = (containerWidth - cropSize) / 2;
    const top = (containerHeight - cropSize) / 2;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Dark mask – 4 regions */}
            <View
                style={[
                    styles.mask,
                    { position: 'absolute', left: 0, right: 0, top: 0, height: top },
                ]}
            />
            <View
                style={[
                    styles.mask,
                    { position: 'absolute', left: 0, right: 0, bottom: 0, height: top },
                ]}
            />
            <View
                style={[
                    styles.mask,
                    { position: 'absolute', left: 0, top, width: left, height: cropSize },
                ]}
            />
            <View
                style={[
                    styles.mask,
                    { position: 'absolute', right: 0, top, width: left, height: cropSize },
                ]}
            />

            {/* Crop frame + grid */}
            <View
                style={[
                    styles.cropBox,
                    {
                        left,
                        top,
                        width: cropSize,
                        height: cropSize,
                    },
                ]}
            >
                {/* Grid lines (rule of thirds) */}
                <View style={styles.gridH1} />
                <View style={styles.gridH2} />
                <View style={styles.gridV1} />
                <View style={styles.gridV2} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mask: {
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    cropBox: {
        position: 'absolute',
        borderWidth: BORDER_WIDTH,
        borderColor: colors.white,
    },
    // Rule-of-thirds grid
    gridH1: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '33.33%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    gridH2: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '66.66%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    gridV1: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '33.33%',
        width: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    gridV2: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '66.66%',
        width: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
});
