import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

// Natural rain: intensity-driven, sparse, random, multi-layer
const rainSource = `
uniform float time;
uniform vec2 resolution;
uniform float intensity;
uniform float thunderstorm;

float hash(vec2 p) {
    p = fract(p * vec2(443.897, 397.297));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
}

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float noise1D(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash11(i), hash11(i + 1.0), u);
}

// Angular noise (no smoothstep) to create the characteristic zig-zag of real lightning
float angularNoise1D(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(hash11(i), hash11(i + 1.0), f);
}

float fbm1D(float x) {
    float v = 0.0;
    float a = 0.5;
    float shift = 100.0;
    v += a * noise1D(x); x = x * 2.0 + shift; a *= 0.5;
    v += a * noise1D(x); x = x * 2.0 + shift; a *= 0.5;
    v += a * noise1D(x); x = x * 2.0 + shift; a *= 0.5;
    v += a * noise1D(x); x = x * 2.0 + shift; a *= 0.5;
    v += a * noise1D(x);
    return v;
}

float streak(vec2 uv, float t, float cols, float rows, float speed, float baseTilt, float inten) {
    uv.x += uv.y * baseTilt;
    uv.y += t * speed * (0.75 + inten * 0.95);

    vec2 gridSize = vec2(cols, rows);
    vec2 cell = floor(uv * gridSize);
    vec2 f = fract(uv * gridSize);

    float r1 = hash(cell);
    float r2 = hash(cell + 127.0);
    float r3 = hash(cell + 253.0);
    float r4 = hash(cell + 419.0);

    float threshold = 0.65 - inten * 0.60;
    float show = step(threshold, r1);

    float lifePhase = fract(r2 * 5.0 + t * (0.1 + r3 * 0.15));
    float flicker = smoothstep(0.0, 0.1, lifePhase) * smoothstep(0.7, 0.55, lifePhase);

    float xOff = 0.1 + r2 * 0.8;
    float dx = f.x - xOff;
    float yOff = fract(f.y + r3 * 10.0);

    float len = (0.07 + r4 * 0.20) * (0.6 + inten * 0.8);
    float thick = (0.007 + r1 * 0.012) * (0.6 + inten * 0.8);

    float xFade = smoothstep(thick, 0.0, abs(dx));
    float yFade = smoothstep(len, 0.0, yOff) * smoothstep(0.0, 0.01, yOff);

    return xFade * yFade * show * flicker * (0.3 + r3 * 0.7);
}

float bolt(vec2 uv, float t, float seed) {
    float window = floor(t * 0.15); 
    if (hash11(window + seed) > 0.3) return 0.0; // 30% chance per cycle

    float localT = fract(t * 0.15) * 6.66; 
    if (localT > 2.0) return 0.0; // Lightning stays alive for up to 2 seconds

    float flash = 0.0;
    // Apple Weather lighting algorithm: Double fast stroke, then a very gentle afterglow fade
    if (localT < 0.05) {
        flash = localT / 0.05; // 1st strike
    } else if (localT < 0.1) {
        flash = 0.0; // Interruption
    } else if (localT < 0.15) {
        flash = (localT - 0.1) / 0.05; // 2nd strike (peak)
    } else {
        // Afterglow fades smoothly from 1.0 to 0.0 over the remaining 1.85s
        flash = 1.0 - smoothstep(0.15, 2.0, localT);
        flash = pow(flash, 2.0); // Create a natural exponential fade curve
    }

    float pathSeed = window * 13.37 + seed;
    
    // Set starting point roughly at the center top
    float startX = 0.4 + hash11(pathSeed * 2.1) * 0.2; 
    
    // Multi-tier zigzag algorithm
    float macro = (angularNoise1D(uv.y * 3.0 + pathSeed) - 0.5) * 0.35; // Macro break
    float mid = (angularNoise1D(uv.y * 12.0 + pathSeed * 2.0) - 0.5) * 0.1; // Mid-level jag
    float micro = (angularNoise1D(uv.y * 40.0 + pathSeed * 3.0) - 0.5) * 0.02; // Micro serration

    float finalX = startX + macro + mid + micro;
    float dist = abs(uv.x - finalX);
    
    // Sharp central core
    float core = smoothstep(0.004, 0.0, dist);
    // Broad outer glow
    float glow = 0.001 / (dist + 0.0005);
    
    // Branching (30% probability)
    // Note: uv.y axis is inverted (1.0 at screen top, 0.0 at bottom)
    float activeBranch = step(0.7, hash11(floor(uv.y * 8.0) + pathSeed));
    float branchDir = sign(hash11(pathSeed * 1.7 + floor(uv.y * 8.0)) - 0.5);
    
    // distDown = 0.0 at the branch origin (top), heading to 1.0 as it falls in the same cell
    float distDown = 1.0 - fract(uv.y * 8.0); 
    
    // Branch diverges further as it goes down
    float branchX = finalX + branchDir * distDown * 0.25 * activeBranch;
    float bDist = abs(uv.x - branchX);
    // Fades out as it extends away from the main trunk (downwards)
    float bGlow = (0.0005 / (bDist + 0.0005)) * (1.0 - distDown) * activeBranch;

    return (core + glow + bGlow) * flash;
}

vec4 main(vec2 FC) {
    vec2 uv = FC / resolution;
    uv.y = 1.0 - uv.y;
    float t = time;
    float i = intensity;

    float rain = 0.0;
    float rainT = t * 0.5; // Halve the falling speed of the rain
    rain += streak(uv,          rainT, 17.0, 7.0,  1.4, 0.10, i) * 0.75;
    rain += streak(uv + 3.71,   rainT, 29.0, 11.0, 2.1, 0.08, i) * 0.55;
    rain += streak(uv + 7.13,   rainT, 43.0, 13.0, 2.9, 0.07, i) * 0.40;
    rain += streak(uv + 13.37,  rainT, 61.0, 17.0, 3.6, 0.05, i) * 0.25;
    rain += streak(uv + 19.71,  rainT, 23.0, 9.0,  1.7, 0.12, i) * 0.60;
    rain += streak(uv + 31.13,  rainT, 37.0, 15.0, 2.5, 0.06, i) * 0.35;

    rain = min(rain, 1.0);
    float alpha = rain * (0.3 + i * 0.4);
    vec3 color = vec3(0.85, 0.92, 1.0);
    
    float lSum = 0.0;
    if (thunderstorm > 0.5) {
        lSum += bolt(uv, t, 1.0);
        lSum += bolt(uv, t + 0.43, 2.0);
    }
    
    // Lightning tint (Cyan-Blue)
    vec3 boltColor = vec3(0.5, 0.8, 1.0);
    vec3 finalColor = color * rain + boltColor * lSum;
    alpha = max(alpha, min(lSum, 1.0)); // Retain super bright lightning but remove ambient sky flash

    return vec4(finalColor, alpha);
}
`;

const rainShader = Skia.RuntimeEffect.Make(rainSource);
if (!rainShader) {
    console.error('Rain Shader failed to compile!');
}

/**
 * Map weather code to rain intensity (0.0 – 1.0)
 */
const getIntensityFromCode = (code: number): number => {
    if (code >= 95) return 1.0;
    if (code === 82) return 0.9;
    if (code === 81) return 0.75;
    if (code === 80) return 0.6;
    if (code === 67) return 0.7;
    if (code === 66) return 0.5;
    if (code === 65) return 0.85;
    if (code === 63) return 0.65;
    if (code === 61) return 0.5;
    if (code >= 56) return 0.35;
    if (code === 55) return 0.4;
    if (code === 53) return 0.3;
    if (code === 51) return 0.25;
    return 0.4;
};

interface RainShaderBackgroundProps {
    /** Weather code from Open-Meteo (51–99) */
    weatherCode?: number;
}

export const RainShaderBackground: React.FC<RainShaderBackgroundProps> = ({ weatherCode = 63 }) => {
    const { width, height } = useWindowDimensions();
    const time = useSharedValue(0);
    const intensity = getIntensityFromCode(weatherCode);

    React.useEffect(() => {
        // Linear increase of time for animation
        time.value = withRepeat(
            withTiming(100, { duration: 50000, easing: Easing.linear }),
            -1,
            false
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        return {
            time: time.value,
            resolution: [width, height],
            intensity,
            thunderstorm: weatherCode >= 95 ? 1.0 : 0.0,
        };
    }, [width, height, intensity, weatherCode]);

    if (!rainShader) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Canvas style={styles.canvas}>
                <Fill>
                    <Shader source={rainShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
