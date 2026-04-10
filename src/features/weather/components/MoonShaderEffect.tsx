import React, { useMemo, useEffect, useRef } from 'react';
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
 * GLSL Shader: 3D crescent moon with BUMP MAPPING.
 * Key technique: surface detail is used as a HEIGHT MAP to perturb normals,
 * making craters and maria cast real shadows/highlights for genuine 3D depth.
 * - Phase: crescent mask (two-circle) — dark side fully transparent
 * - 3D: bump-mapped sphere with perturbed normals
 * - Surface: procedural maria + craters + multi-octave FBM noise
 * - Glow: soft atmospheric halo
 */
const moonShaderSource = `
uniform float time;
uniform vec2 resolution;
uniform vec2 moonCenter;
uniform float moonRadius;
uniform float phase;

// ── Noise ──
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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

float fbm(vec2 p) {
    float t = 0.0;
    float a = 0.5;
    float f = 1.0;
    for (int i = 0; i < 5; i++) {
        t += noise(p * f) * a;
        f *= 2.17;
        a *= 0.48;
    }
    return t;
}

// ── Height map: used for BOTH color AND bump mapping ──
float heightMap(vec2 nUV) {
    float h = 0.0;

    // Large maria (dark lowlands)
    h += smoothstep(0.55, 0.18, length(nUV - vec2(-0.22, 0.20))) * 0.22;
    h += smoothstep(0.40, 0.10, length(nUV - vec2(0.10, 0.24))) * 0.18;
    h += smoothstep(0.44, 0.14, length(nUV - vec2(0.22, -0.02))) * 0.17;
    h += smoothstep(0.24, 0.06, length(nUV - vec2(0.44, 0.14))) * 0.14;
    h += smoothstep(0.34, 0.08, length(nUV - vec2(0.30, -0.24))) * 0.13;
    h += smoothstep(0.36, 0.10, length(nUV - vec2(-0.14, -0.32))) * 0.12;
    h += smoothstep(0.22, 0.05, length(nUV - vec2(-0.36, -0.26))) * 0.10;
    h += smoothstep(0.62, 0.22, length(nUV - vec2(-0.32, -0.06))) * 0.15;
    h += smoothstep(0.52, 0.18, length(nUV - vec2(0.0, 0.44))) * 0.09;

    // Medium craters (depressions)
    h += smoothstep(0.13, 0.03, length(nUV - vec2(-0.46, 0.12))) * 0.08;
    h += smoothstep(0.11, 0.02, length(nUV - vec2(0.36, -0.36))) * 0.07;
    h += smoothstep(0.09, 0.02, length(nUV - vec2(-0.16, 0.46))) * 0.06;
    h += smoothstep(0.10, 0.02, length(nUV - vec2(0.12, -0.44))) * 0.06;
    h += smoothstep(0.08, 0.02, length(nUV - vec2(-0.42, -0.38))) * 0.05;
    h += smoothstep(0.07, 0.01, length(nUV - vec2(0.40, 0.30))) * 0.05;

    // Fine noise (micro-craters + regolith)
    h += fbm(nUV * 5.0) * 0.08; 
    h += fbm(nUV * 12.0 + vec2(43.0, 17.0)) * 0.04;

    return clamp(h, 0.0, 0.50);
}

vec4 main(vec2 FC) {
    vec2 uv = FC / resolution;
    vec2 center = moonCenter;

    float aspect = resolution.x / resolution.y;
    vec2 diff = uv - center;
    diff.x *= aspect;

    // ── TILT ROTATION ──
    // Nghiêng mặt trăng một góc khoảng 20 độ (0.35 rad) để trông tự nhiên hơn
    float angle = -0.35; 
    float cosA = cos(angle);
    float sinA = sin(angle);
    mat2 rot = mat2(cosA, -sinA, sinA, cosA);
    diff = rot * diff;

    float dist = length(diff);

    float r = moonRadius;

    // ── 1. Moon disc mask ──
    float discMask = smoothstep(r, r - 0.003, dist);

    // ── 2. Crescent phase mask ──
    float phaseNorm = phase * 2.0;
    float crescentFactor = phaseNorm - 1.0;
    float shadowOffset = (1.0 - abs(crescentFactor)) * r * 2.2;
    // Ensure original light direction (D-shape crescent)
    float dir = sign(crescentFactor);
    // Calculate shadow from rotated diff (Moon center is at 0,0 locally)
    vec2 shadowCenter = vec2(dir * shadowOffset, 0.0);
    vec2 shadowDiff = diff - shadowCenter;
    float shadowDist = length(shadowDiff);
    float shadowMask = smoothstep(r * 1.01 + 0.003, r * 1.01 - 0.003, shadowDist);
    float crescentMask = discMask * (1.0 - shadowMask);

    // ── 3. Sphere geometry ──
    vec2 surfUV = diff / r;
    float sphereDist = length(surfUV);
    float z = sqrt(max(0.0, 1.0 - sphereDist * sphereDist));
    vec3 normal = normalize(vec3(surfUV, z));

    // ── 4. BUMP MAPPING — the key to 3D look ──
    // Compute height at current point & neighbors (central differences)
    float eps = 0.02;
    float hC = heightMap(surfUV);
    float hR = heightMap(surfUV + vec2(eps, 0.0));
    float hU = heightMap(surfUV + vec2(0.0, eps));

    // Gradient of the height field
    float dx = (hR - hC) / eps;
    float dy = (hU - hC) / eps;

    // Compute tangent & bitangent from sphere normal
    vec3 tangent = normalize(cross(
        abs(normal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0),
        normal
    ));
    vec3 bitangent = cross(normal, tangent);

    // Perturb the normal — bump strength controls 3D intensity
    float bumpStrength = 4.0; 
    vec3 perturbedN = normalize(normal - bumpStrength * (dx * tangent + dy * bitangent));

    // ── 5. Lighting with PERTURBED normal ──
    // Directional light source
    vec3 lightDir = normalize(vec3(dir * 0.8, 0.3, 0.6));
    float lambertian = max(0.0, dot(perturbedN, lightDir));
    float lighting = 0.45 + 0.55 * smoothstep(0.0, 0.6, lambertian);

    // ── 6. Surface color from height map ──
    vec3 highland = vec3(0.92, 0.90, 0.86);
    vec3 mariaCol = vec3(0.50, 0.48, 0.46);
    vec3 surfaceColor = mix(highland, mariaCol, hC);

    // Subtle color variation
    float colorVar = fbm(surfUV * 3.5 + vec2(100.0, 200.0)) * 0.04;
    surfaceColor -= vec3(colorVar * 0.8, colorVar, colorVar * 1.2);

    // Apply lighting
    vec3 litSurface = surfaceColor * lighting;

    // ── 7. Fresnel rim ──
    float fresnel = pow(1.0 - z, 3.0);
    litSurface += vec3(0.88, 0.91, 1.0) * fresnel * 0.22;

    // ── 8. Glow ──
    float pulse = 1.0 + 0.02 * sin(time * 0.6);
    float edgeDist = max(0.0, dist - r);
    float innerGlow = exp(-edgeDist * edgeDist / (0.003 * pulse)) * 0.35;
    float outerGlow = exp(-edgeDist / (r * 1.6)) * 0.10 * pulse;
    float moonlight = exp(-dist / (r * 5.0)) * 0.03;
    float totalGlow = innerGlow + outerGlow + moonlight;
    vec3 glowRGB = vec3(0.80, 0.86, 0.98) * totalGlow;

    // ── 9. Combine ──
    vec3 surfRGB = litSurface * crescentMask;
    vec3 finalRGB = glowRGB + surfRGB;
    float glowAlpha = clamp(totalGlow * 0.7, 0.0, 1.0);
    float finalAlpha = clamp(crescentMask + glowAlpha, 0.0, 1.0);

    return vec4(finalRGB * finalAlpha, finalAlpha);
}
`;

const moonShader = Skia.RuntimeEffect.Make(moonShaderSource);
if (!moonShader) {
    console.error('[MoonShader] Shader failed to compile!');
}

// ── Lunar phase calculation ──

/**
 * Calculate the current lunar phase (0-1).
 * 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
 */
const calculateLunarPhase = (): number => {
    const now = new Date();
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const synodicMonth = 29.53058770576;
    const daysSinceRef = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const lunations = daysSinceRef / synodicMonth;
    return lunations - Math.floor(lunations);
};

/**
 * Parse time string to decimal hours.
 */
const parseTimeToHours = (timeStr: string): number => {
    const trimmed = timeStr.trim().toUpperCase();
    if (trimmed.includes('T')) {
        const timePart = trimmed.split('T')[1];
        const [h, m] = timePart.split(':').map(Number);
        return h + (m || 0) / 60;
    }
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');
    const cleaned = trimmed.replace(/\s*(AM|PM)\s*/i, '');
    const parts = cleaned.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);
    if (isPM && h !== 12) {
        h += 12;
    } else if (isAM && h === 12) {
        h = 0;
    }
    return h + m / 60;
};

// ── DEMO MODE: set to true to animate moon trajectory and phase for testing ──
const DEMO_MODE = false;

interface MoonShaderEffectProps {
    readonly sunset?: string;
    readonly sunrise?: string;
    readonly radius?: number;
    readonly canvasHeight?: number;
    readonly scrollY?: SharedValue<number>;
}

const MoonShaderEffect: React.FC<MoonShaderEffectProps> = ({
    sunset = '18:00',
    sunrise = '05:30',
    radius = 0.055,
    canvasHeight,
    scrollY,
}) => {
    const { width, height } = useWindowDimensions();
    const effectiveHeight = canvasHeight ?? height * 0.55;
    const time = useSharedValue(0);

    const lunarPhase = useMemo(() => calculateLunarPhase(), []);

    // Calculate night progress
    const sunsetH = useMemo(() => parseTimeToHours(sunset), [sunset]);
    const sunriseH = useMemo(() => parseTimeToHours(sunrise), [sunrise]);

    const realProgressValue = useMemo(() => {
        const nightLength = sunriseH < sunsetH ? 24 - sunsetH + sunriseH : sunriseH - sunsetH;
        if (nightLength <= 0) return 0.5;
        const currentHours = new Date().getHours() + new Date().getMinutes() / 60;
        let hoursSinceSunset: number;
        if (currentHours >= sunsetH) {
            hoursSinceSunset = currentHours - sunsetH;
        } else {
            hoursSinceSunset = 24 - sunsetH + currentHours;
        }
        return Math.max(0, Math.min(1, hoursSinceSunset / nightLength));
    }, [sunsetH, sunriseH]);

    // Smooth shared value for moon progress
    const realProgress = useSharedValue(realProgressValue);
    useEffect(() => {
        realProgress.value = withTiming(realProgressValue, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
        });
    }, [realProgressValue, realProgress]);

    // Greeting animation: moon travels along its parabolic arc from horizon
    const animProgress = useSharedValue(0);
    const fadeIn = useSharedValue(0);
    const hasAnimated = useRef(false);

    const testProgress = useSharedValue(0.0);
    const testPhase = useSharedValue(0.05);

    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            // Animate from arc start (horizon) to current position
            animProgress.value = withTiming(1, {
                duration: 1800,
                easing: Easing.out(Easing.cubic),
            });
            // Fade in gradually to prevent flash
            fadeIn.value = withTiming(1, {
                duration: 1500,
                easing: Easing.out(Easing.quad),
            });
        }
    }, [animProgress, fadeIn]);

    useEffect(() => {
        if (DEMO_MODE) {
            testProgress.value = withRepeat(
                withTiming(1.0, { duration: 8000, easing: Easing.linear }),
                -1,
                true
            );
            testPhase.value = withRepeat(
                withTiming(0.5, { duration: 8000, easing: Easing.linear }),
                -1,
                true
            );
        }
    }, [testProgress, testPhase]);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(200, { duration: 100000, easing: Easing.linear }),
            -1,
            false
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        let finalPhase = lunarPhase;

        if (DEMO_MODE) {
            const prog = testProgress.value;
            const x = 0.12 + prog * 0.76;
            const zenithY = 0.08;
            const horizonY = 0.3;
            const parabola = Math.pow(2 * prog - 1, 2);
            const y = zenithY + (horizonY - zenithY) * parabola;
            finalPhase = testPhase.value;
            return {
                time: time.value,
                resolution: [Math.max(1, width), Math.max(1, effectiveHeight)],
                moonCenter: [x, y],
                moonRadius: radius,
                phase: finalPhase,
            };
        }

        // Greeting arc animation
        const prog = animProgress.value * realProgress.value;
        const x = 0.12 + prog * 0.76;
        const zenithY = 0.08;
        const horizonY = 0.3;
        const parabola = Math.pow(2 * prog - 1, 2);
        const y = zenithY + (horizonY - zenithY) * parabola;

        return {
            time: time.value,
            resolution: [Math.max(1, width), Math.max(1, effectiveHeight)],
            moonCenter: [x, y],
            moonRadius: radius,
            phase: finalPhase,
        };
    }, [width, effectiveHeight, radius, lunarPhase]);

    const animatedStyle = useAnimatedStyle(() => {
        const scrollOpacity = scrollY ? interpolate(scrollY.value, [0, 200], [1, 0], 'clamp') : 1;
        const translateY = scrollY ? interpolate(scrollY.value, [0, 300], [0, -80], 'clamp') : 0;
        return {
            transform: [{ translateY }],
            opacity: fadeIn.value * scrollOpacity,
        };
    });

    if (!moonShader) {
        console.error('[MoonShader] Shader is null, not rendering');
        return null;
    }

    return (
        <Animated.View
            style={[styles.container, { height: effectiveHeight }, animatedStyle]}
            pointerEvents="none"
        >
            <Canvas style={styles.canvas}>
                <Fill>
                    <Shader source={moonShader} uniforms={uniforms} />
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

export default React.memo(MoonShaderEffect);
