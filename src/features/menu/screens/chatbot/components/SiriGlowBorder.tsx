import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, RoundedRect, SweepGradient, vec, Blur } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const PADDING = 50;
const SIRI_COLORS = ['#FF6BA6', '#C084FC', '#67E8F9', '#FCD34D', '#FB923C', '#ff0000ff'];

export const SiriGlowBorder: React.FC = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(Math.PI * 2, { duration: 5000, easing: Easing.linear }),
            -1,
            false
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onLayout = (e: LayoutChangeEvent) => {
        setSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        });
    };

    const cX = size.width / 2;
    const cY = size.height / 2;
    const innerW = size.width - PADDING * 2;
    const innerH = size.height - PADDING * 2;

    const transform = useDerivedValue(() => [{ rotate: rotation.value }]);

    return (
        <View
            style={[StyleSheet.absoluteFill, { margin: -PADDING, zIndex: -1 }]}
            onLayout={onLayout}
            pointerEvents="none"
        >
            {size.width > 0 && (
                <Canvas style={{ flex: 1 }}>
                    <RoundedRect
                        x={PADDING}
                        y={PADDING}
                        width={innerW}
                        height={innerH}
                        r={16}
                        style="stroke"
                        strokeWidth={30}
                        opacity={0.55}
                    >
                        <SweepGradient c={vec(cX, cY)} colors={SIRI_COLORS} transform={transform} />
                        <Blur blur={30} />
                    </RoundedRect>
                </Canvas>
            )}
        </View>
    );
};
