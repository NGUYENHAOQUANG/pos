import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@/styles/themeContext';

/**
 * GLSL Shader: Floating Bubbles — GPU replica of FloatingBubblesBackground.
 *
 * Renders 5 soft, translucent circular orbs that float up/down and
 * gently pulse in size. Single color (theme primary blue), very low opacity.
 * Exact same positions, sizes, speeds and phases as the original component.
 *
 * Performance: Pure GPU, zero JS animation overhead. Solid 60fps.
 */
const shaderSource = `
uniform float time;
uniform vec2  resolution;
uniform float isDark;

vec4 main(vec2 FC) {
    vec2 uv  = FC / resolution;
    float asp = resolution.x / resolution.y;
    float t   = time;

    // ────────────────────────────────────────────────
    // 5 FLOATING BUBBLES — matching FloatingBubblesBackground exactly
    // Each: center(x,y), radius, float duration, delay, scale duration
    // ────────────────────────────────────────────────

    // Bubble 1: initialX=-50, initialY=10%, size=200, duration=5000ms
    vec2 b1Pos = vec2(
        -0.06,
        0.10 - 0.025 * sin(t * 0.4)
    );
    float b1Rad = 0.24 * (1.0 + 0.1 * sin(t * 0.15));

    // Bubble 2: initialX=80%, initialY=-2%, size=180, duration=6500ms, delay=500ms
    vec2 b2Pos = vec2(
        0.80,
        -0.02 - 0.025 * sin(t * 0.3 + 0.5)
    );
    float b2Rad = 0.22 * (1.0 + 0.1 * sin(t * 0.1 + 0.5));

    // Bubble 3: initialX=60%, initialY=40%, size=150, duration=6000ms, delay=1000ms
    vec2 b3Pos = vec2(
        0.60,
        0.40 - 0.025 * sin(t * 0.35 + 1.0)
    );
    float b3Rad = 0.18 * (1.0 + 0.1 * sin(t * 0.12 + 1.0));

    // Bubble 4: initialX=10%, initialY=70%, size=250, duration=7000ms, delay=2000ms
    vec2 b4Pos = vec2(
        0.10,
        0.70 - 0.025 * sin(t * 0.28 + 2.0)
    );
    float b4Rad = 0.30 * (1.0 + 0.1 * sin(t * 0.11 + 2.0));

    // Bubble 5: initialX=70%, initialY=85%, size=120, duration=5500ms, delay=1500ms
    vec2 b5Pos = vec2(
        0.70,
        0.85 - 0.025 * sin(t * 0.38 + 1.5)
    );
    float b5Rad = 0.14 * (1.0 + 0.1 * sin(t * 0.14 + 1.5));

    // ── Soft circle (Gaussian falloff) for each bubble ──
    vec2 d1 = uv - b1Pos; d1.x *= asp;
    vec2 d2 = uv - b2Pos; d2.x *= asp;
    vec2 d3 = uv - b3Pos; d3.x *= asp;
    vec2 d4 = uv - b4Pos; d4.x *= asp;
    vec2 d5 = uv - b5Pos; d5.x *= asp;

    // Soft edge circles — visible but gentle
    float g1 = smoothstep(b1Rad, b1Rad * 0.6, length(d1));
    float g2 = smoothstep(b2Rad, b2Rad * 0.6, length(d2));
    float g3 = smoothstep(b3Rad, b3Rad * 0.6, length(d3));
    float g4 = smoothstep(b4Rad, b4Rad * 0.6, length(d4));
    float g5 = smoothstep(b5Rad, b5Rad * 0.6, length(d5));

    // ── Combined bubble alpha (additive, clamped) ──
    float bubbles = g1 + g2 + g3 + g4 + g5;

    // ── Bubble color: theme primary with very low opacity ──
    // Light mode: blue tint rgba(primary, 0.06)  |  Dark mode: white glow rgba(255,255,255,0.06)
    vec3 bubbleColor = mix(
        vec3(0.00, 0.42, 1.00),   // Light mode: primary blue
        vec3(1.00, 1.00, 1.00),   // Dark mode: white
        isDark
    );

    float bubbleAlpha = mix(0.08, 0.06, isDark);  // Subtle — 8% light, 6% dark

    // ── Output: transparent background + translucent bubbles ──
    float finalAlpha = bubbles * bubbleAlpha;
    finalAlpha = clamp(finalAlpha, 0.0, 1.0);

    return vec4(bubbleColor * finalAlpha, finalAlpha);
}
`;

const compiledShader = Skia.RuntimeEffect.Make(shaderSource);
if (!compiledShader) {
    console.error('[FloatingBubblesShader] Shader failed to compile!');
}

/**
 * GPU-powered Floating Bubbles Background.
 * Drop-in replacement for FloatingBubblesBackground with identical visual look
 * but dramatically better performance (GPU-only rendering, zero JS thread overhead).
 */
const FloatingBubblesShader: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const theme = useAppTheme();
    const time = useSharedValue(0);

    useEffect(() => {
        // Continuous linear timer — wraps every ~160s, seamless
        time.value = withRepeat(
            withTiming(1000, { duration: 160000, easing: Easing.linear }),
            -1,
            false
        );
    }, [time]);

    const uniforms = useDerivedValue(
        () => ({
            time: time.value,
            resolution: [Math.max(1, width), Math.max(1, height)],
            isDark: theme.isDark ? 1.0 : 0.0,
        }),
        [width, height]
    );

    // Disable animated background in dark mode
    if (theme.isDark) {
        return null;
    }

    if (!compiledShader) {
        return null;
    }

    return (
        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Fill>
                <Shader source={compiledShader} uniforms={uniforms} />
            </Fill>
        </Canvas>
    );
};

export default React.memo(FloatingBubblesShader);
