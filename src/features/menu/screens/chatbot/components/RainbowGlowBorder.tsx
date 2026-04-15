import React, { useEffect, useState } from 'react';
import { StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, RoundedRect, SweepGradient, vec, Blur, Group } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { colors } from '@/styles/colors';

// Diverse rainbow glow colors from colors.ts palette
const GLOW_COLORS = [
    colors.pink[600],
    colors.purple[600],
    colors.primary,
    colors.primaryLight,
    colors.teal[600],
    colors.green[600],
    colors.yellow[700],
    colors.orange[800],
    colors.magenta[900],
    colors.pink[600],
];

// Volume range from Voice API is typically -2 to 10
const MIN_VOLUME = -2;
const MAX_VOLUME = 10;

// Border thickness for the glow effect
const BORDER_THICKNESS = 3;

interface RainbowGlowBorderProps {
    /** Voice volume level from speech recognition (-2 to 10) */
    volume?: number;
}

/**
 * A voice-reactive rainbow glow border rendered INSIDE the input bounds.
 *
 * Renders as the first child of inputPrimary (absolutely positioned).
 * Draws a gradient-filled rounded rect matching the input shape, then
 * cuts out the inner area with the glass background — leaving only
 * a glowing gradient border visible. The blur creates a soft, neon-like
 * glow that bleeds INWARD, avoiding all Android overflow clipping issues.
 */
export const RainbowGlowBorder: React.FC<RainbowGlowBorderProps> = ({ volume = 0 }) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    // Slow rotation for the sweep gradient
    const rotation = useSharedValue(0);
    // Volume-driven shared value
    const animatedVolume = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(Math.PI * 2, { duration: 6000, easing: Easing.linear }),
            -1,
            false
        );
    }, [rotation]);

    useEffect(() => {
        const normalized = Math.min(
            1,
            Math.max(0, (volume - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME))
        );
        animatedVolume.value = withSpring(normalized, {
            damping: 12,
            stiffness: 150,
            mass: 0.5,
        });
    }, [volume, animatedVolume]);

    const onLayout = (e: LayoutChangeEvent) => {
        setSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        });
    };

    const cX = size.width / 2;
    const cY = size.height / 2;

    const transform = useDerivedValue(() => [{ rotate: rotation.value }]);

    // Opacity: base 0.6 idle → 1.0 at max volume
    const opacity = useDerivedValue(() => {
        return 0.6 + animatedVolume.value * 0.4;
    });

    // Blur: 6 idle → 14 at max volume (inward bleed)
    const glowBlur = useDerivedValue(() => {
        return 6 + animatedVolume.value * 8;
    });

    // Stroke width: base border + volume expansion
    const strokeWidth = useDerivedValue(() => {
        return BORDER_THICKNESS + animatedVolume.value * 4;
    });

    return (
        <Canvas style={styles.canvas} onLayout={onLayout}>
            {size.width > 0 && size.height > 0 && (
                <Group opacity={opacity}>
                    {/* Glow border — gradient stroke on the input shape */}
                    <RoundedRect
                        x={0}
                        y={0}
                        width={size.width}
                        height={size.height}
                        r={16}
                        style="stroke"
                        strokeWidth={strokeWidth}
                    >
                        <SweepGradient c={vec(cX, cY)} colors={GLOW_COLORS} transform={transform} />
                        <Blur blur={glowBlur} />
                    </RoundedRect>
                </Group>
            )}
        </Canvas>
    );
};

const styles = StyleSheet.create({
    canvas: {
        ...StyleSheet.absoluteFillObject,
        // Ensure canvas renders above background but below content
        zIndex: 0,
    },
});
