// src/shared/components/layout/WaveHeader.tsx
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLOR_DARK = '#007CFF';
const COLOR_LIGHT = '#8FD5FF';

type WaveOptions = {
    height?: number; // Chiều cao của sóng (từ đáy)
    amplitude?: number; // Biên độ sóng (độ cao của đỉnh)
    speed?: number; // Tốc độ animation (0-1)
    points?: number; // Số điểm để tạo sóng (càng nhiều càng mượt)
};

type WaveHeaderProps = {
    title?: string;
    height?: number; // Chiều cao của container
    width?: number; // Chiều rộng của container
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    horizontalPadding?: number;
    backgroundColor?: string; // Màu nền của container
    fill1?: string; // Màu sóng lớp 1 (chính)
    fill2?: string; // Màu sóng lớp 2 (nền)
    paused?: boolean; // Tạm dừng animation (giống react-wavify)
    options?: WaveOptions; // Options giống react-wavify
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Tạo path sóng mượt mà dựa trên sine wave (giống react-wavify)
 * Sử dụng nhiều điểm để tạo đường cong mượt mà
 * QUAN TRỌNG: Phải là worklet để chạy trên UI thread
 */
const createWavePath = (
    width: number,
    containerHeight: number,
    waveHeight: number,
    amplitude: number,
    points: number,
    phase: number
): string => {
    'worklet';
    const svgWidth = width * 2; // Vẽ dài gấp đôi để seamless loop
    const step = svgWidth / points;
    const baseY = containerHeight - waveHeight; // Vị trí base của sóng

    let path = `M 0 ${baseY}`;

    // Tạo các điểm sóng dựa trên sine wave
    for (let i = 1; i <= points; i++) {
        const x = i * step;
        // Sử dụng sine wave với phase để tạo animation
        const y = baseY - amplitude * Math.sin((i / points) * Math.PI * 2 + phase);

        if (i === 1) {
            // Điểm đầu - smooth start
            const cpX = step * 0.3;
            const cpY = baseY;
            path += ` Q ${cpX} ${cpY} ${x} ${y}`;
        } else {
            // Sử dụng smooth cubic bezier
            const prevX = (i - 1) * step;
            const prevAngle = ((i - 1) / points) * Math.PI * 2 + phase;
            const prevY = baseY - amplitude * Math.sin(prevAngle);

            const prevPrevX = (i - 2) * step;
            const prevPrevAngle = ((i - 2) / points) * Math.PI * 2 + phase;
            const prevPrevY = baseY - amplitude * Math.sin(prevPrevAngle);

            // Catmull-Rom style control points
            const dx1 = prevX - prevPrevX;
            const dy1 = prevY - prevPrevY;
            const dx2 = x - prevX;
            const dy2 = y - prevY;

            const cp1X = prevX + dx1 * 0.3;
            const cp1Y = prevY + dy1 * 0.3;
            const cp2X = x - dx2 * 0.3;
            const cp2Y = y - dy2 * 0.3;

            path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`;
        }
    }

    // Đóng path xuống đáy
    path += ` L ${svgWidth} ${containerHeight} L 0 ${containerHeight} Z`;

    return path;
};

export const WaveHeader: React.FC<WaveHeaderProps> = ({
    title,
    height = 160,
    width = SCREEN_WIDTH,
    containerStyle,
    titleStyle,
    horizontalPadding = 16,
    backgroundColor = COLOR_DARK,
    fill1 = COLOR_LIGHT,
    fill2 = COLOR_LIGHT,
    paused = false,
    options = {},
}) => {
    const {
        height: waveHeight = 20, // Chiều cao sóng từ đáy
        amplitude = 20, // Biên độ sóng
        speed = 0.15, // Tốc độ (0-1)
        points = 3, // Số điểm (tối thiểu 3)
    } = options;

    const svgHeight = height;
    const svgWidth = width * 2;
    const numPoints = Math.max(3, points * 20); // Tăng số điểm để mượt hơn

    // Animation phase cho sóng
    const phase1 = useSharedValue(0);
    const phase2 = useSharedValue(Math.PI * 0.5); // Lệch pha 90 độ

    useEffect(() => {
        if (paused) {
            return;
        }

        // Tính duration dựa trên speed (speed càng cao, duration càng ngắn)
        const duration = 5000 / (speed || 0.15);

        phase1.value = withRepeat(
            withTiming(Math.PI * 2, {
                duration,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        phase2.value = withRepeat(
            withTiming(Math.PI * 2, {
                duration: duration * 1.4, // Chạy chậm hơn
                easing: Easing.linear,
            }),
            -1,
            false
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paused, speed]);

    // Animated props cho path động (giống react-wavify)
    const wave1AnimatedProps = useAnimatedProps(() => {
        'worklet';
        const path = createWavePath(
            width,
            svgHeight,
            waveHeight,
            amplitude,
            numPoints,
            phase1.value
        );
        return { d: path };
    });

    const wave2AnimatedProps = useAnimatedProps(() => {
        'worklet';
        const path = createWavePath(
            width,
            svgHeight,
            waveHeight * 0.8,
            amplitude * 0.7,
            numPoints,
            phase2.value
        );
        return { d: path };
    });

    // Animation style cho translateX (seamless loop)
    const wave1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: -(phase1.value / (Math.PI * 2)) * width }],
    }));

    const wave2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: -(phase2.value / (Math.PI * 2)) * width * 0.6 }],
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    height,
                    width,
                    backgroundColor,
                },
                containerStyle,
            ]}
        >
            {/* Sóng nền - chạy chậm hơn, opacity thấp, màu fill2 */}
            <AnimatedSvg
                width={svgWidth}
                height={svgHeight}
                style={[wave2Style, styles.waveAbsolute]}
            >
                <AnimatedPath animatedProps={wave2AnimatedProps} fill={fill2} opacity={0.5} />
            </AnimatedSvg>

            {/* Sóng chính - rõ nét, màu fill1 */}
            <AnimatedSvg
                width={svgWidth}
                height={svgHeight}
                style={[wave1Style, styles.waveAbsolute]}
            >
                <AnimatedPath animatedProps={wave1AnimatedProps} fill={fill1} opacity={0.95} />
            </AnimatedSvg>

            {/* Title */}
            {title ? (
                <View style={[styles.titleContainer, { paddingHorizontal: horizontalPadding }]}>
                    <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

export default WaveHeader;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    waveAbsolute: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        alignItems: 'flex-start',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },
});
