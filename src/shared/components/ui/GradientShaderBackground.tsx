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
 * GLSL Shader: "Domain Warping" Fluid Gradient.
 *
 * This is the same technique used by top-tier creative studios and featured
 * on Shadertoy by Inigo Quilez. Domain warping takes gradient UV coordinates
 * and warps them recursively, creating deeply organic, cloud-like fluid flows.
 *
 * Visual result: Slow-rolling Aurora-like waves of brand color — subtle but premium.
 * Performance: Pure O(1) math, zero textures, zero loops — locked 60fps.
 */
const gradientShaderSource = `
uniform float time;
uniform vec2  resolution;
uniform float isDark;

vec4 main(vec2 FC) {
    // Normalized UV, centered & aspect-corrected
    vec2 uv = FC / resolution;
    float t  = time * 0.18;   // smooth, cinematic pace

    // ── Layer 1: Domain Warp q (first fold of space) ──
    // Each component is a sum of two sin/cos waves at different frequencies & phases.
    // This alone creates a swirling turbulence field.
    vec2 q = vec2(
        sin(uv.x * 3.1 + t * 1.1) * cos(uv.y * 2.3 - t * 0.6) +
        sin(uv.y * 4.7 + t * 0.4) * 0.5,

        cos(uv.x * 2.8 - t * 0.8) * sin(uv.y * 3.9 + t * 1.2) +
        cos(uv.x * 5.1 - t * 0.3) * 0.5
    );

    // ── Layer 2: Domain Warp r (second fold, using q to warp again) ──
    // This is the "recursive" step that makes IQ's domain warping so special.
    // It warps the already-warped space, making the pattern deeply irregular.
    vec2 r = vec2(
        sin(uv.x * 2.4 + q.x * 1.8 + t * 0.9) * cos(uv.y * 1.9 + q.y - t),
        cos(uv.x * 3.1 + q.y * 1.6 - t * 0.7) * sin(uv.y * 2.7 + q.x + t * 0.4)
    );

    // ── Scalar field from warped coordinates ──
    // length(r) maps the 2D warp into a 0..1 float we use for color mixing.
    float f  = length(r) * 0.5 + 0.5;
    float f2 = clamp(f * f, 0.0, 1.0);

    // ── Brand Colors ──
    vec3 cA = mix(vec3(0.000, 0.680, 0.992), vec3(0.00, 0.25, 0.45), isDark); // #00ADFD light blue
    vec3 cB = mix(vec3(1.000, 0.392, 0.494), vec3(0.40, 0.12, 0.18), isDark); // #FF647E pink/coral
    vec3 cC = mix(vec3(0.000, 0.416, 1.000), vec3(0.00, 0.14, 0.40), isDark); // #006AFF deep blue

    // ── 3-stop color gradient mapped through f ──
    // f near 0.0 → cA (light blue)
    // f near 0.5 → cB (pink)
    // f near 1.0 → cC (deep blue)
    vec3 color = mix(cA, cB, smoothstep(0.0, 0.5, f));
    color = mix(color, cC, smoothstep(0.4, 1.0, f2));

    // ── Gentle vignette to fade edges ──
    float dist     = distance(uv, vec2(0.5, 0.5));
    float vignette = 1.0 - smoothstep(0.35, 0.9, dist) * 0.2;
    color *= vignette;

    // ── Breathing: very subtle liveness pulse ──
    color *= 1.0 + 0.03 * sin(t * 2.5);

    // ── Soft overlay blend on white background ──
    float alpha   = mix(0.40, 0.28, isDark);
    vec3 bg       = mix(vec3(0.98, 0.97, 0.97), vec3(0.05, 0.05, 0.08), isDark);
    vec3 finalCol = mix(bg, color, alpha);

    return vec4(finalCol * alpha, alpha);
}
`;

const gradientShader = Skia.RuntimeEffect.Make(gradientShaderSource);
if (!gradientShader) {
    console.error('[GradientShader] Shader failed to compile!');
}

const GradientShaderBackground: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const theme = useAppTheme();
    const time = useSharedValue(0);

    useEffect(() => {
        // Long loop for perfectly smooth, seamless animation
        time.value = withRepeat(
            withTiming(500, { duration: 100000, easing: Easing.linear }),
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

    if (!gradientShader) {
        return null;
    }

    return (
        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Fill>
                <Shader source={gradientShader} uniforms={uniforms} />
            </Fill>
        </Canvas>
    );
};

export default React.memo(GradientShaderBackground);
