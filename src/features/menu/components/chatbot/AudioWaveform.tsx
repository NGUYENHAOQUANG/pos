import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { colors } from '@/styles/colors';

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const TOTAL_BAR_SPACE = BAR_WIDTH + BAR_GAP;
const SCROLL_SPEED = 70;

interface AudioWaveformProps {
    volume: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ volume }) => {
    const [width, setWidth] = useState(0);
    const height = 40;

    const latestVolume = useSharedValue(0);

    // Using a typed array for maximum efficiency handling the volume buffer history
    const history = useSharedValue<number[]>([]);
    const shiftX = useSharedValue(0);

    const maxBars = Math.floor(width / TOTAL_BAR_SPACE) + 2;

    useEffect(() => {
        latestVolume.value = volume;
    }, [volume, latestVolume]);

    useFrameCallback(frameInfo => {
        if (width === 0) return;

        // dt: Delta time in seconds
        const dt = (frameInfo.timeSincePreviousFrame || 16) / 1000;

        shiftX.value += SCROLL_SPEED * dt;

        // Auto decay the latest voice intensity
        latestVolume.value = Math.max(0, latestVolume.value - 24 * dt);

        let currentShift = shiftX.value;
        const arr = [...history.value];
        let arrayChanged = false;

        // As scrolling passes one bar span, lock a new frame
        while (currentShift >= TOTAL_BAR_SPACE) {
            currentShift -= TOTAL_BAR_SPACE;
            shiftX.value = currentShift;

            // Only pop the oldest bar if we've filled the screen width
            if (arr.length >= maxBars) {
                arr.shift();
            }

            // Normalize raw volume
            const normalized = Math.min(Math.max(0, latestVolume.value), 12) / 12;
            arr.push(normalized);

            arrayChanged = true;
        }

        if (arrayChanged) {
            history.value = arr;
        }
    });

    const path = useDerivedValue(() => {
        const p = Skia.Path.Make();
        if (width === 0 || history.value.length === 0) return p;

        const arr = history.value;
        const len = arr.length;

        // The newest element is drawn at the right end of the view
        const rightEdge = width;

        for (let i = 0; i < len; i++) {
            // Index 0 is the farthest left point (oldest), len-1 is the farthest right point (newest)
            const offsetFromNewest = (len - 1 - i) * TOTAL_BAR_SPACE;

            // X-Coordinate continuously subtracts the fractional shiftX float to provide fluid sub-pixel movement
            const x = rightEdge - offsetFromNewest - shiftX.value;

            // Optimization: Ensure we don't bother rendering elements completely out of view
            if (x + BAR_WIDTH < 0 || x > width) {
                continue;
            }

            const vol = arr[i];
            const currentHeight = 3 + vol * (height - 6);
            const y = (height - currentHeight) / 2; // Math to center the bar symmetrically above and below the baseline

            p.addRRect({
                rect: { x, y, width: BAR_WIDTH, height: currentHeight },
                rx: BAR_WIDTH / 2,
                ry: BAR_WIDTH / 2,
            });
        }

        return p;
    });

    const onLayout = (e: LayoutChangeEvent) => {
        const nw = e.nativeEvent.layout.width;
        if (nw > 0 && width === 0) setWidth(nw);
    };

    return (
        <View style={styles.container} onLayout={onLayout}>
            {width > 0 && (
                <Canvas style={{ width, height }}>
                    <Path path={path} color={colors.black} />
                </Canvas>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 40,
        overflow: 'hidden',
    },
});
