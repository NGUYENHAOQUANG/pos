import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AVTIcon from '@/assets/Icon/IconChatBot/AVTIcon.svg';
import { Canvas, Shader, Skia, RoundedRect } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    useAnimatedStyle,
    interpolate,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AVATAR_SIZE = 40;

// Big star path (bottom-left, larger)
const BIG_STAR_PATH =
    'M10.1817 5.89054C10.4431 4.84486 11.9291 4.84486 12.1905 5.89054L12.6983 7.92179C13.3608 10.5713 15.4296 12.6402 18.0791 13.3026L20.1104 13.8105C21.156 14.0719 21.156 15.5578 20.1104 15.8193L18.0791 16.3271C15.4296 16.9896 13.3607 19.0583 12.6983 21.7079L12.1866 23.7528C11.9254 24.7976 10.4417 24.7991 10.1788 23.7548L9.67094 21.7392C9.00948 19.1122 6.96447 17.0574 4.34086 16.3827L2.19828 15.8319C1.15812 15.5644 1.16316 14.0847 2.20512 13.8241L4.29301 13.3026C6.94254 12.6402 9.01135 10.5713 9.67387 7.92179L10.1817 5.89054Z';

// Small star path (top-right, smaller)
const SMALL_STAR_PATH =
    'M20.4922 0.727455C20.6119 0.249699 21.2915 0.249706 21.4112 0.727455L21.6436 1.65617C21.9465 2.8677 22.892 3.81422 24.1036 4.1171L25.0323 4.34855C25.5104 4.46807 25.5103 5.14793 25.0323 5.26749L24.1036 5.49992C22.8922 5.80278 21.9466 6.74852 21.6436 7.95988L21.4092 8.89542C21.2898 9.37299 20.6117 9.37362 20.4913 8.8964L20.2588 7.97452C19.9564 6.77352 19.0217 5.83389 17.8223 5.52531L16.8418 5.27335C16.3666 5.15077 16.3694 4.47447 16.8457 4.35538L17.7998 4.1171C19.0114 3.81422 19.9569 2.8677 20.2598 1.65617L20.4922 0.727455Z';

/**
 * Animated gradient shader for the avatar — same FBM noise + pastel palette
 * as ChatbotShaderBackground, but tuned for a small circular area.
 */
const avatarShaderSource = `
uniform float time;
uniform vec2  resolution;

// ----- Noise Functions -----
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

// Function to generate an organic, wobbly blob
float blob(vec2 uv, vec2 center, float radius, float t, float seed) {
    vec2 pos = uv - center;
    // Add noise wobble to the blob boundaries
    float n = noise(uv * 3.0 + t + seed);
    float dist = length(pos) + n * radius * 0.4;
    return smoothstep(radius, radius * 0.1, dist);
}

vec4 main(vec2 FC) {
    vec2 uv = FC / resolution;
    float t = time * 0.5;

    // Pastel colors
    vec3 skyBlue    = vec3(170.0, 210.0, 248.0) / 255.0;
    vec3 lavender   = vec3(205.0, 190.0, 240.0) / 255.0;
    vec3 peach      = vec3(248.0, 200.0, 185.0) / 255.0;
    vec3 warmYellow = vec3(250.0, 230.0, 195.0) / 255.0;

    // Create slowly drifting centers for 4 color blobs
    vec2 c1 = vec2(0.5 + 0.3*sin(t*0.7), 0.5 + 0.3*cos(t*0.8));
    vec2 c2 = vec2(0.5 + 0.3*sin(t*0.5 + 2.0), 0.5 + 0.3*cos(t*0.6 + 1.0));
    vec2 c3 = vec2(0.5 + 0.3*sin(t*0.9 + 4.0), 0.5 + 0.3*cos(t*0.7 + 3.0));
    vec2 c4 = vec2(0.5 + 0.3*sin(t*0.6 + 5.0), 0.5 + 0.3*cos(t*0.9 + 2.0));

    // Calculate weights for each blob with noise
    float radius = 0.7;
    float w1 = blob(uv, c1, radius, t, 0.0);
    float w2 = blob(uv, c2, radius, t, 10.0);
    float w3 = blob(uv, c3, radius, t, 20.0);
    float w4 = blob(uv, c4, radius, t, 30.0);

    // Normalize weights to blend them smoothly
    float sum = w1 + w2 + w3 + w4 + 0.2; // Add base to avoid dividing by 0
    w1 /= sum;
    w2 /= sum;
    w3 /= sum;
    w4 /= sum;

    // Base background color (a gentle mix of all)
    vec3 baseColor = (skyBlue + lavender + peach + warmYellow) * 0.25;

    // Mix colors based on the blob weights
    vec3 color = baseColor;
    color = mix(color, skyBlue, w1);
    color = mix(color, lavender, w2);
    color = mix(color, peach, w3);
    color = mix(color, warmYellow, w4);

    return vec4(color, 1.0);
}
`;

// Module scope — compile once, reuse across all instances
const avatarShader = Skia.RuntimeEffect.Make(avatarShaderSource);
if (!avatarShader) {
    console.error('[ChatbotAvatar] Shader failed to compile!');
}

interface ChatbotAvatarProps {
    size?: number;
    /** Whether the shader background animates. Default false (static). */
    animated?: boolean;
}

// ── Static avatar — no hooks, just SVG asset ──
const StaticAvatar: React.FC<{ size: number }> = React.memo(({ size }) => {
    return (
        <View
            style={[styles.staticContainer, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <AVTIcon width={size} height={size} />
        </View>
    );
});

// ── Animated avatar — full shader + breathing stars ──
const AnimatedAvatar: React.FC<{ size: number }> = React.memo(({ size }) => {
    const r = size / 2;
    const iconSize = size * 0.55;

    // Shader time driver — runs on UI thread, feeds GPU via useDerivedValue
    const time = useSharedValue(0);

    // Single breathing cycle (0 → 1 → 0) drives both stars via interpolate
    const breathCycle = useSharedValue(0);

    useEffect(() => {
        // Shader time driver
        time.value = withRepeat(
            withTiming(200, { duration: 40000, easing: Easing.linear }),
            -1,
            false
        );

        // Single breathing animation — one shared value for all star transforms
        breathCycle.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            false
        );
    }, [time, breathCycle]);

    // Shader uniforms — derived on UI thread
    const uniforms = useDerivedValue(
        () => ({
            time: time.value,
            resolution: [size, size],
        }),
        [size]
    );

    // Big star: scale 1.0 → 0.8 (shrinks at peak)
    const bigStarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(breathCycle.value, [0, 1], [1, 0.8]) }],
    }));

    // Small star: scale 1.0 → 0.4, opacity 1.0 → 0.5 (inverse phase — shrinks/fades at peak)
    const smallStarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(breathCycle.value, [0, 1], [1, 0.4]) }],
        opacity: interpolate(breathCycle.value, [0, 1], [1, 0.5]),
    }));

    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: r }]}>
            {/* Shader background — GPU rendered, no touch needed */}
            {avatarShader && (
                <Canvas style={{ width: size, height: size }} pointerEvents="none">
                    <RoundedRect x={0} y={0} width={size} height={size} r={r}>
                        <Shader source={avatarShader} uniforms={uniforms} />
                    </RoundedRect>
                </Canvas>
            )}

            {/* Star overlay — Animated.View outside Svg for proper animation support */}
            <View style={[styles.iconOverlay, { width: size, height: size }]} pointerEvents="none">
                {/* Big star (bottom-left, larger) */}
                <Animated.View style={[styles.starLayer, bigStarStyle]}>
                    <Svg width={iconSize} height={iconSize} viewBox="0 0 26 26" fill="none">
                        <Path d={BIG_STAR_PATH} fill="white" />
                    </Svg>
                </Animated.View>

                {/* Small star (top-right, smaller) */}
                <Animated.View style={[styles.starLayer, smallStarStyle]}>
                    <Svg width={iconSize} height={iconSize} viewBox="0 0 26 26" fill="none">
                        <Path d={SMALL_STAR_PATH} fill="white" />
                    </Svg>
                </Animated.View>
            </View>
        </View>
    );
});

export const ChatbotAvatar: React.FC<ChatbotAvatarProps> = React.memo(
    ({ size = AVATAR_SIZE, animated = false }) => {
        if (animated) return <AnimatedAvatar size={size} />;
        return <StaticAvatar size={size} />;
    }
);

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    staticContainer: {
        overflow: 'hidden',
    },
    iconOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starLayer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
