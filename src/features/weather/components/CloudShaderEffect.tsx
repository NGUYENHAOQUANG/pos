import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedStyle,
    interpolate,
    SharedValue,
} from 'react-native-reanimated';

const cloudShaderSource = `
uniform float time;
uniform vec2 resolution;
uniform float coverage; 
uniform float isNight;

// ── Random noise hash function ──
float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

// ── Value Noise (Base noise structure) ──
float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(p + vec2(0.0, 0.0));
    float b = hash(p + vec2(1.0, 0.0));
    float c = hash(p + vec2(0.0, 1.0));
    float d = hash(p + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// ── Fractional Brownian Motion (Volumetric structure) ──
float fbm(vec2 p) {
    float f = 0.0;
    float a = 0.5;
    mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
        f += a * noise(p);
        p = m * p * 2.0;
        a *= 0.5;
    }
    return f;
}

vec4 main(vec2 fc) {
    vec2 uv = fc / resolution.xy;
    vec2 p = uv;
    p.x *= resolution.x / resolution.y;
    
    // Phóng to scale để ra từng tảng mây thay vì khói nhòe
    p *= 3.0;
    
    // Tốc độ trôi ngang (Drift speed)
    float drift = time * 0.08; 
    
    // Lớp 1: Cấu trúc mây tảng lớn, trôi từ từ qua trái
    vec2 p1 = p + vec2(drift, 0.0);
    float n1 = fbm(p1);
    
    // Lớp 2: Lớp mây bề mặt nhỏ hơn, trôi nhanh hơn xíu và dùng để khoét lõm (tạo độ tơi xốp)
    vec2 p2 = p * 1.5 + vec2(drift * 1.5, 0.0);
    float n2 = fbm(p2);
    
    // Trừ đi lớp bề mặt sẽ tạo ra những tảng cụm mây rõ rệt (Tránh bị xoáy cuộn như khói)
    float f = n1 - n2 * 0.4;
    
    // Threshold map theo coverage
    float threshold = 1.0 - coverage;
    
    // Smoothstep gắt hơn để chia cụm mây rõ ràng
    float density = smoothstep(threshold - 0.15, threshold + 0.35, f);
    
    // Tính bóng đổ 3D (Shadow volumetric) - Mây có chiều sâu
    // Bằng cách lấy mẫu noise dịch nhẹ lên phía trên (ánh sáng mặt trời chiếu xuống)
    float shadowMask = fbm(p1 + vec2(0.0, 0.3)) - fbm(p2 + vec2(0.0, 0.3)) * 0.4;
    float shadow = smoothstep(threshold - 0.15, threshold + 0.35, shadowMask);
    
    // ── Màu sắc của mây ──
    vec3 dayCol = vec3(1.0, 1.0, 1.0); // Mây trắng ban ngày
    vec3 nightCol = vec3(0.18, 0.22, 0.30); // Giả lập ban đêm
    vec3 baseCol = mix(dayCol, nightCol, isNight);
    
    // Đổ bóng tối dưới đáy mây, sáng trên đỉnh
    vec3 finalCol = baseCol * mix(0.4, 1.15, shadow);
    
    // ── Alpha Adjustments ──
    // Mờ dần về phía chân trời
    float fadeOut = smoothstep(0.8, 0.1, uv.y);
    float alpha = density * fadeOut * 0.90; // Opacity 90%

    // Premultiplied alpha output
    return vec4(finalCol * alpha, alpha);
}
`;

const cloudShader = Skia.RuntimeEffect.Make(cloudShaderSource);

interface CloudShaderEffectProps {
    readonly weatherCode: number;
    readonly isDay: boolean;
    readonly scrollY?: SharedValue<number>;
    readonly zIndex?: number;
}

const CloudShaderEffect: React.FC<CloudShaderEffectProps> = ({
    weatherCode,
    isDay,
    scrollY,
    zIndex = 5,
}) => {
    const { width, height } = useWindowDimensions();
    const time = useSharedValue(0);

    // Use Open-Meteo weather code to determine cloud coverage
    const coverage = useMemo(() => {
        if (weatherCode === 1) return 0.25; // Partly cloudy
        if (weatherCode === 2) return 0.55; // Cloudy
        if (weatherCode === 3) return 0.85; // Overcast
        if (weatherCode >= 45) return 0.65; // Rain/Fog adds some clouds
        return 0.0;
    }, [weatherCode]);

    useEffect(() => {
        // Continuous cloud drifting (Linear interpolation)
        time.value = withRepeat(
            withTiming(2000, { duration: 300000, easing: Easing.linear }),
            -1,
            false
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        return {
            time: time.value,
            resolution: [width, height],
            coverage: coverage,
            isNight: isDay ? 0.0 : 1.0,
        };
    }, [width, height, coverage, isDay]);

    const animatedStyle = useAnimatedStyle(() => {
        if (!scrollY) return {};
        // Parallax: As user scrolls, clouds move up slower than background
        const translateY = interpolate(scrollY.value, [0, height], [0, -height * 0.4]);
        return { transform: [{ translateY }] };
    });

    if (!cloudShader || coverage === 0) return null;

    return (
        <Animated.View
            style={[StyleSheet.absoluteFill, { zIndex }, animatedStyle]}
            pointerEvents="none"
        >
            <Canvas style={StyleSheet.absoluteFill}>
                <Fill>
                    <Shader source={cloudShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
        </Animated.View>
    );
};

export default React.memo(CloudShaderEffect);
