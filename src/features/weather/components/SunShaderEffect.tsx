import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
    SharedValue,
} from 'react-native-reanimated';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

/**
 * GLSL Shader: Realistic sun with soft glow, rotating rays, lens flare.
 * Brightness is toned down (~0.6x) for a natural, non-blinding look.
 */
const sunShaderSource = `
uniform float time;
uniform vec2 resolution;
uniform vec2 sunCenter;
uniform float sunRadius;

vec4 main(vec2 FC) {
    vec2 uv = FC / resolution;
    vec2 center = sunCenter;

    float aspect = resolution.x / resolution.y;
    vec2 diff = uv - center;
    diff.x *= aspect;
    float dist = length(diff);
    float angle = atan(diff.y, diff.x);

    float t = time * 0.3;
    float pulse = 1.0 + 0.06 * sin(time * 1.2) + 0.03 * sin(time * 2.7);

    // ── 1. Bright Core ──
    float coreRadius = sunRadius * 0.30;
    float core = smoothstep(coreRadius, coreRadius * 0.1, dist) * 0.85;

    // ── 2. Inner Glow (warm, wide) ──
    float innerGlow = exp(-dist * dist / (sunRadius * sunRadius * 0.7)) * 0.7 * pulse;

    // ── 3. Outer Glow ──
    float outerGlow = exp(-dist / (sunRadius * 2.5)) * 0.3 * pulse;

    // ── 4. Atmospheric Haze (wide spread) ──
    float haze = exp(-dist / (sunRadius * 5.0)) * 0.12;

    // ── 5. Light Rays (Optimized Procedural) ──
    // Replaced 32-iteration loops with continuous fast trig functions for massive performance boost
    float ray1 = max(0.0, sin(angle * 12.0 + t * 0.8));
    ray1 = pow(ray1, 8.0) * exp(-dist / (sunRadius * 3.0)) * 0.8;
    
    float ray2 = max(0.0, sin(angle * 20.0 - t * 0.5 + 1.0));
    ray2 = pow(ray2, 16.0) * exp(-dist / (sunRadius * 2.0)) * 0.5;
    
    float rayIntensity = 0.5 + 0.5 * sin(angle * 7.0 + t * 1.5);
    float rays = (ray1 + ray2) * rayIntensity * 0.25;

    // ── 6. Lens Flare (horizontal streak) ──
    float flareH = exp(-abs(diff.y) * resolution.y * 0.10)
                  * exp(-dist / (sunRadius * 3.5)) * 0.12;

    // ── 7. Rainbow Arc (pastel, additive) ──
    float arcRadius = sunRadius * 2.8;
    float arcWidth = sunRadius * 0.7;
    float arcDist = abs(dist - arcRadius);
    float arcMask = exp(-arcDist * arcDist / (arcWidth * arcWidth * 0.06));
    
    // Show mostly below the sun for natural look
    float belowSun = smoothstep(-0.02, 0.08, diff.y);
    arcMask *= belowSun;
    
    // Map position within the ring band to rainbow spectrum (SKSL-safe, no if/else)
    float hueT = clamp((dist - arcRadius + arcWidth) / (arcWidth * 2.0), 0.0, 1.0);
    
    // Smooth rainbow via sine-based RGB channels offset by 120 degrees
    // Inner = warm (pink/red), middle = green/yellow, outer = blue/cyan
    vec3 arcColor = vec3(
        0.85 + 0.15 * cos((hueT - 0.0) * 4.0),
        0.75 + 0.20 * cos((hueT - 0.4) * 4.0),
        0.70 + 0.25 * cos((hueT - 0.8) * 4.0)
    );
    
    float rainbowStrength = arcMask * 0.10;
    
    // ── 8. Apple Weather Style Lens Flare ──
    vec2 screenCenter = vec2(0.5, 0.5);
    vec2 V = screenCenter - center; // Vector from sun to screen center
    vec2 flareDir = normalize(V);
    
    vec3 bokehRGB = vec3(0.0);
    
    // Bubble 1: Close to sun, small and bright, slightly blue
    vec2 diff1 = uv - (center + flareDir * 0.15);
    diff1.x *= aspect;
    bokehRGB += vec3(0.8, 0.9, 1.0) * smoothstep(0.02, 0.015, length(diff1)) * 0.15;
    
    // Bubble 2: Halfway to center, medium small, cyan tint
    vec2 diff2 = uv - (center + V * 0.5);
    diff2.x *= aspect;
    bokehRGB += vec3(0.7, 0.9, 1.0) * smoothstep(0.04, 0.03, length(diff2)) * 0.08;
    
    // Bubble 3: Mirrored across center (classic lens artifact), large faint soft blob instead of a ring
    vec2 diff3 = uv - (center + V * 2.2);
    diff3.x *= aspect;
    bokehRGB += vec3(1.0, 0.95, 0.8) * smoothstep(0.20, 0.10, length(diff3)) * 0.03;
    
    // Bubble 4: Post-center, small, very sharp and bright
    vec2 diff4 = uv - (center + V * 1.3);
    diff4.x *= aspect;
    bokehRGB += vec3(0.8, 1.0, 0.9) * smoothstep(0.025, 0.015, length(diff4)) * 0.15;
    
    // Bubble 5: Near mirrored point, medium faint
    vec2 diff5 = uv - (center + V * 1.8);
    diff5.x *= aspect;
    bokehRGB += vec3(0.9, 1.0, 0.8) * smoothstep(0.06, 0.05, length(diff5)) * 0.06;

    // ── Combine ──
    float totalBrightness = (core + innerGlow + outerGlow + haze + rays + flareH) * 0.8;

    // Color: warm white -> golden -> amber
    vec3 warmWhite = vec3(1.0, 0.97, 0.90);
    vec3 golden    = vec3(1.0, 0.82, 0.45);
    vec3 amber     = vec3(1.0, 0.60, 0.25);

    vec3 baseColor = mix(warmWhite, golden, smoothstep(0.0, sunRadius * 1.5, dist));
    baseColor = mix(baseColor, amber, smoothstep(sunRadius * 1.0, sunRadius * 4.0, dist));
    baseColor = mix(baseColor, vec3(1.0, 0.99, 0.95), core * 0.3);
    
    // Additive mix of all effects
    vec3 finalRGB = (baseColor * totalBrightness) + (arcColor * rainbowStrength * 1.5) + bokehRGB;

    // Estimate highest alpha contribution
    float maxBokeh = max(bokehRGB.r, max(bokehRGB.g, bokehRGB.b));
    float finalAlpha = clamp(totalBrightness + (rainbowStrength * 1.5) + maxBokeh, 0.0, 1.0);

    return vec4(finalRGB, finalAlpha);
}
`;

const sunShader = Skia.RuntimeEffect.Make(sunShaderSource);
if (!sunShader) {
    console.error('[SunShader] Shader failed to compile!');
}

// ── Sun arc calculation based on real time ──

/**
 * Parse time string to decimal hours in LOCAL timezone.
 * Handles: ISO "2026-04-09T05:48", "HH:MM", "05:53 AM", "06:10 PM"
 */
const parseTimeToHours = (timeStr: string): number => {
    const trimmed = timeStr.trim().toUpperCase();

    // Handle ISO with 'T' separator — extract HH:MM directly
    if (trimmed.includes('T')) {
        const timePart = trimmed.split('T')[1]; // "05:48"
        const [h, m] = timePart.split(':').map(Number);
        return h + (m || 0) / 60;
    }

    // Handle 12-hour AM/PM format: "05:53 AM", "06:10 PM"
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');

    // Strip AM/PM suffix to get "HH:MM"
    const cleaned = trimmed.replace(/\s*(AM|PM)\s*/i, '');
    const parts = cleaned.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);

    if (isPM && h !== 12) {
        h += 12; // 6 PM → 18
    } else if (isAM && h === 12) {
        h = 0; // 12 AM → 0
    }

    return h + m / 60;
};

/**
 * Calculate sun position on a parabolic arc across the sky.
 *
 * Returns { x, y } normalized to [0, 1]:
 * - x: 0.12 (east/left) at sunrise → 0.5 at solar noon → 0.88 (west/right) at sunset
 * - y: ~0.40 at horizon → ~0.15 at zenith
 */
const calculateSunPosition = (
    sunrise: string,
    sunset: string,
    overrideHour?: number
): { x: number; y: number } => {
    const sunriseH = parseTimeToHours(sunrise);
    const sunsetH = parseTimeToHours(sunset);
    const dayLength = sunsetH - sunriseH;

    const currentHours = overrideHour ?? new Date().getHours() + new Date().getMinutes() / 60;
    if (dayLength <= 0) {
        return { x: 0.5, y: 0.18 };
    }
    // Progress through the day: 0 = sunrise, 1 = sunset
    const progress = Math.max(0, Math.min(1, (currentHours - sunriseH) / dayLength));

    // Horizontal: left (0.12) at sunrise → right (0.88) at sunset
    const x = 0.12 + progress * 0.76;

    // Vertical: parabolic arc (y=0 is top, y=1 is bottom)
    const zenithY = 0.08;
    const horizonY = 0.3;
    const parabola = Math.pow(2 * progress - 1, 2);
    const y = zenithY + (horizonY - zenithY) * parabola;

    // console.log('[SunShader] Progress:', progress.toFixed(3), '→ pos:', { x: x.toFixed(3), y: y.toFixed(3) });
    return { x, y };
};

// ── DEMO MODE: set to false for real-time sun tracking ──
const DEMO_MODE = false;
const DEMO_INTERVAL_MS = 2000; // Advance 1 hour every 2 seconds

interface SunShaderEffectProps {
    /** Sunrise time string (ISO or "HH:MM") */
    readonly sunrise?: string;
    /** Sunset time string (ISO or "HH:MM") */
    readonly sunset?: string;
    /** Size of sun core relative to screen (default 0.15) */
    readonly radius?: number;
    /** Height of the shader canvas */
    readonly canvasHeight?: number;
    /** Scroll offset shared value for parallax */
    readonly scrollY?: SharedValue<number>;
}

const SunShaderEffect: React.FC<SunShaderEffectProps> = ({
    sunrise = '05:30',
    sunset = '18:00',
    radius = 0.15,
    canvasHeight,
    scrollY,
}) => {
    const { width, height } = useWindowDimensions();
    const effectiveHeight = canvasHeight ?? height * 0.55;
    const time = useSharedValue(0);

    // Demo mode: simulated hour that increments every 2s
    const sunriseH = useMemo(() => parseTimeToHours(sunrise), [sunrise]);
    const sunsetH = useMemo(() => parseTimeToHours(sunset), [sunset]);
    const [demoHour, setDemoHour] = useState(sunriseH);

    useEffect(() => {
        if (!DEMO_MODE) return;
        const interval = setInterval(() => {
            setDemoHour(prev => {
                const next = prev + 1;
                // Loop back to sunrise when past sunset
                return next > sunsetH ? sunriseH : next;
            });
        }, DEMO_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [sunriseH, sunsetH]);

    // Calculate sun position (demo or real)
    const sunPos = useMemo(
        () => calculateSunPosition(sunrise, sunset, DEMO_MODE ? demoHour : undefined),
        [sunrise, sunset, demoHour]
    );

    // Smooth animated position using Reanimated
    const sunPosX = useSharedValue(sunPos.x);
    const sunPosY = useSharedValue(sunPos.y);

    useEffect(() => {
        sunPosX.value = withTiming(sunPos.x, { duration: 800, easing: Easing.out(Easing.ease) });
        sunPosY.value = withTiming(sunPos.y, { duration: 800, easing: Easing.out(Easing.ease) });
    }, [sunPos.x, sunPos.y, sunPosX, sunPosY]);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(200, { duration: 100000, easing: Easing.linear }),
            -1,
            false
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        return {
            time: time.value,
            resolution: [width, effectiveHeight],
            sunCenter: [sunPosX.value, sunPosY.value],
            sunRadius: radius,
        };
    }, [width, effectiveHeight, radius]);

    // Parallax: sun moves up slower than scroll
    const animatedStyle = useAnimatedStyle(() => {
        if (!scrollY) {
            return {};
        }
        const translateY = interpolate(scrollY.value, [0, 300], [0, -80], 'clamp');
        const opacity = interpolate(scrollY.value, [0, 200], [1, 0], 'clamp');
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    if (!sunShader) {
        console.error('[SunShader] Shader is null, not rendering');
        return null;
    }

    console.log('[SunShader] Rendering with pos:', sunPos, 'canvas:', width, 'x', effectiveHeight);

    return (
        <Animated.View
            style={[styles.container, { height: effectiveHeight }, animatedStyle]}
            pointerEvents="none"
        >
            <Canvas style={styles.canvas}>
                <Fill>
                    <Shader source={sunShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        bottom: undefined,
    },
    canvas: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default React.memo(SunShaderEffect);
