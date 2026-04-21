import React, { useEffect } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

// ── Animated gradient shader — organic morphing color blobs ──
const animatedShaderSource = `
uniform float time;
uniform vec2  resolution;

// Smooth noise helper
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal brownian motion for organic shapes
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 FC) {
    vec2 uv = FC / resolution;
    float t = time;

    // --- Colors from design ---
    vec3 skyBlue   = vec3(160.0, 205.0, 245.0) / 255.0;
    vec3 lavender  = vec3(200.0, 185.0, 235.0) / 255.0;
    vec3 lilac     = vec3(220.0, 200.0, 240.0) / 255.0;
    vec3 peach     = vec3(248.0, 195.0, 175.0) / 255.0;
    vec3 warmYellow= vec3(248.0, 232.0, 200.0) / 255.0;
    vec3 softPink  = vec3(240.0, 210.0, 215.0) / 255.0;

    // --- Animated noise fields for organic blending ---
    float n1 = fbm(uv * 2.5 + vec2(t * 0.15, t * 0.12));
    float n2 = fbm(uv * 3.0 + vec2(-t * 0.10, t * 0.18));
    float n3 = fbm(uv * 2.0 + vec2(t * 0.08, -t * 0.14));

    // --- Rotating base gradient (colors shift positions over time) ---
    float angle = t * 0.2;
    vec2 center = vec2(0.5, 0.5);
    vec2 dir = vec2(cos(angle), sin(angle));
    float gradientPos = dot(uv - center, dir) + 0.5;
    gradientPos = clamp(gradientPos + n1 * 0.2, 0.0, 1.0);

    // 4-stop rotating gradient
    vec3 base = mix(skyBlue, lavender, smoothstep(0.0, 0.35, gradientPos));
    base = mix(base, softPink, smoothstep(0.3, 0.65, gradientPos));
    base = mix(base, warmYellow, smoothstep(0.65, 1.0, gradientPos));

    // --- Overlay animated color patches ---
    float blueBlob = smoothstep(0.55, 0.2,
        length(uv - vec2(
            0.5 + 0.35 * sin(t * 0.25),
            0.5 + 0.35 * cos(t * 0.2)
        )) + n1 * 0.12
    );

    float purpleBlob = smoothstep(0.50, 0.2,
        length(uv - vec2(
            0.5 + 0.30 * cos(t * 0.3 + 1.5),
            0.5 + 0.30 * sin(t * 0.25 + 1.0)
        )) + n2 * 0.15
    );

    float peachBlob = smoothstep(0.50, 0.2,
        length(uv - vec2(
            0.5 + 0.30 * sin(t * 0.22 + 3.0),
            0.5 + 0.30 * cos(t * 0.28 + 2.0)
        )) + n2 * 0.12
    );

    float yellowBlob = smoothstep(0.40, 0.2,
        length(uv - vec2(
            0.5 + 0.32 * cos(t * 0.18 + 4.5),
            0.5 + 0.28 * sin(t * 0.3 + 3.5)
        )) + n3 * 0.10
    );

    // --- Blend patches onto base ---
    vec3 color = base;
    color = mix(color, skyBlue,   blueBlob   * 0.65);
    color = mix(color, lilac,     purpleBlob * 0.6);
    color = mix(color, peach,     peachBlob  * 0.55);
    color = mix(color, warmYellow,yellowBlob * 0.4);

    // --- Subtle brightness breathing ---
    color *= 0.85 + 0.02 * sin(t * 1.5);

    return vec4(color, 1.0);
}
`;

// Compile animated shader once at module scope
const animatedShader = Skia.RuntimeEffect.Make(animatedShaderSource);

if (!animatedShader) console.error('[ChatbotShaderBackground] Animated shader failed to compile!');

// Static background image asset
const STATIC_BG = require('@/assets/Icon/IconChatBot/Chatbot.png');

// ── Static background — instant render, no shader compile ──
const StaticBackground: React.FC = React.memo(() => (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image source={STATIC_BG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
));

// ── Animated background — time-driven shader ──
const AnimatedBackground: React.FC<{ width: number; height: number }> = React.memo(
    ({ width, height }) => {
        const time = useSharedValue(0);

        useEffect(() => {
            time.value = withRepeat(
                withTiming(200, { duration: 40000, easing: Easing.linear }),
                -1,
                false
            );
            return () => cancelAnimation(time);
        }, [time]);

        const uniforms = useDerivedValue(
            () => ({
                time: time.value,
                resolution: [Math.max(1, width), Math.max(1, height)],
            }),
            [width, height]
        );

        if (!animatedShader) return null;

        return (
            <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Fill>
                    <Shader source={animatedShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
        );
    }
);

export const ChatbotShaderBackground: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const isAnimated = useSettingsStore(s => s.chatbotAnimatedBgEnabled);

    return (
        <>
            {/* Fallback bg color — prevents white flash while animated shader compiles */}
            {isAnimated && (
                <View
                    style={[StyleSheet.absoluteFillObject, styles.fallback]}
                    pointerEvents="none"
                />
            )}
            {isAnimated ? (
                <AnimatedBackground width={width} height={height} />
            ) : (
                <StaticBackground />
            )}
        </>
    );
};

export default React.memo(ChatbotShaderBackground);

const styles = StyleSheet.create({
    fallback: {
        // Average of gradient corners — prevents white flash
        backgroundColor: '#D4CFEA',
    },
});
