import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as shape from 'd3-shape';
// import { scaleTime, scaleLinear } from 'd3-scale'; // Removed to avoid d3-array resolution issues
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

// --- Utils: Robust Manual Scales ---
const scaleLinear = ({ domain, range }: { domain: number[]; range: number[] }) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;

    return (x: number) => {
        if (d1 === d0) return r0;
        return r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
    };
};

const scaleTime = ({ domain, range }: { domain: Date[]; range: number[] }) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const t0 = d0.getTime();
    const t1 = d1.getTime();

    return (x: Date) => {
        if (t1 === t0) return r0;
        return r0 + ((x.getTime() - t0) / (t1 - t0)) * (r1 - r0);
    };
};

// --- Formatters ---
const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
};

// --- Types ---
interface DataPoint {
    date: Date;
    pH: number; // Light Blue (Flat/Wavy)
    DO: number; // Orange (Medium)
    Temp: number; // Green (Tall Spikes) - actually "Nhiệt độ" usually isn't this spiky, but mapping to image visual
    Alk: number; // Brown (Stepped)
    Clear: number; // Dark Blue (High Freq)
    Salt: number; // Dark Red (Flat)
    Ammonia: number; // Dark Green (Bottom Flat)
}

// --- Mock Data Pattern Generators ---
const generateData = (): DataPoint[] => {
    const data: DataPoint[] = [];
    const baseDate = new Date(2025, 10, 1); // Nov 1st

    // Adjusted to 45 days for better performance (less lag) while allowing some scrolling
    for (let i = 0; i < 45; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);

        // 1. Brown (Stepped)
        let alk = 3.2;
        if (i > 15) alk = 4.0;
        if (i > 25) alk = 4.9;
        if (i > 60) alk = 5.5;
        if (i > 100) alk = 6.0; // New step
        if (i > 150) alk = 5.8; // Dropdown

        // 2. Light Green (Spiky)
        const temp = 6 + (Math.random() > 0.7 ? Math.random() * 4 : Math.random() * 2 - 1);

        // 3. Orange (Steady)
        let doVal = 6.5 + Math.random() * 1.2 - 0.5;
        if (i > 120) doVal -= 0.5; // Slight trend change

        // 4. Light Blue (Wavy)
        const ph = 6 + Math.sin(i * 0.1) * 0.5 + Math.random() * 0.1; // Slower wave

        // 5. Dark Red (Flat High)
        const salt = 1.8;

        // 6. Dark Blue (High Freq - Irregular/Chaotic)
        // Range 0.8 - 1.5 (Strictly below Salt at 1.8)
        const clear = 0.8 + Math.random() * 0.7;

        // 7. Dark Green (Flat Low)
        let ammonia = 0.1;
        if (i === 18 || i === 25 || i === 70 || i === 140) ammonia = 0.5;

        data.push({
            date: date,
            pH: ph,
            DO: doVal,
            Temp: temp,
            Alk: alk,
            Clear: clear,
            Salt: salt,
            Ammonia: ammonia,
        });
    }
    return data;
};

const DATA = generateData();
const GRAPH_HEIGHT = 380;

// Helper for Animated Label (Now Static)
const AnimatedLabel = ({ date, baseX }: { date: Date; baseX: number }) => {
    return (
        <View style={{ position: 'absolute', left: baseX, bottom: 0 }}>
            {/* Center the text: marginLeft: -30 to center a width 60 view */}
            <View style={{ width: 60, marginLeft: -30 }}>
                <Text style={styles.axisLabelCenter}>{formatDate(date)}</Text>
            </View>
        </View>
    );
};

export default function EnvChar() {
    const [layout, setLayout] = useState({ width: 0, height: 0 });

    // Shared Values for Gestures
    const translateX = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);

    // Derived dimensions for clamping
    const density = 9; // Increased spacing to allow scrolling with few data points
    const axisWidth = 30; // Left and Right fixed width

    // The visible viewport width for the chart content
    const chartAreaWidth = Math.max(0, layout.width - axisWidth * 2);

    const contentWidth = Math.max(chartAreaWidth, DATA.length * density);
    const maxTranslateX = 0;
    const minTranslateX = Math.min(0, chartAreaWidth - contentWidth);

    // Extended type for tooltip state
    type SelectedPoint = DataPoint & { x: number; y: number };
    const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);

    // Gestures
    const pan = Gesture.Pan()
        .onChange(e => {
            const nextTranslate = savedTranslateX.value + e.translationX;
            if (nextTranslate > maxTranslateX) {
                translateX.value = maxTranslateX; // Right edge (start of chart)
            } else if (nextTranslate < minTranslateX) {
                translateX.value = minTranslateX; // Left edge (end of chart)
            } else {
                translateX.value = nextTranslate;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
        });

    // Tap Gesture for Tooltip
    const tap = Gesture.Tap().onEnd(e => {
        const internalX = e.x - translateX.value; // Scale is 1, so removed division
        const index = Math.round(internalX / density);

        if (index >= 0 && index < DATA.length) {
            const item = DATA[index];
            runOnJS(setSelectedPoint)({
                ...item,
                x: e.x,
                y: e.y,
            });
        } else {
            runOnJS(setSelectedPoint)(null);
        }
    });

    const composed = Gesture.Race(pan, tap);
    const handleCloseTooltip = () => setSelectedPoint(null);

    // Split animations
    const scrollStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // Use values calculated top-level
    const height = layout.height || GRAPH_HEIGHT;

    const minDate = DATA[0].date;
    const maxDate = DATA[DATA.length - 1].date;

    const scaleX = scaleTime({
        domain: [minDate, maxDate],
        range: [20, contentWidth],
    });

    const scaleY = scaleLinear({
        domain: [0, 12],
        range: [height - 40, 10], // Leave room for axis labels
    });

    // Helper to render Just the Line (Scaled)
    // Removed zoomStyle usage since scale is fixed to 1

    // Helper to render Just the Line (Scaled)

    // Helper to render Just the Line (Scaled)
    const RenderLineSeries = ({
        dataKey,
        color,
        strokeWidth = 1,
    }: {
        dataKey: keyof DataPoint;
        color: string;
        strokeWidth?: number;
    }) => {
        const lineGen = shape
            .line<DataPoint>()
            .x(d => scaleX(d.date))
            .y(d => scaleY(d[dataKey] as number))
            .curve(shape.curveLinear);

        const path = lineGen(DATA);

        return <Path d={path || ''} stroke={color} strokeWidth={strokeWidth} fill="none" />;
    };

    // Helper to render Just the Dots (Static Position)
    const RenderDotSeries = ({ dataKey, color }: { dataKey: keyof DataPoint; color: string }) => {
        return (
            <G>
                {DATA.map((d, i) => (
                    <Circle
                        key={i}
                        cx={scaleX(d.date)}
                        cy={scaleY(d[dataKey] as number)}
                        r={2.5}
                        fill={color}
                        stroke={colors.white}
                        strokeWidth={0.5}
                    />
                ))}
            </G>
        );
    };

    // Layout handling
    const onLayout = (event: LayoutChangeEvent) => {
        setLayout(event.nativeEvent.layout);
    };

    const xTicks = DATA.filter((_, i) => i % 14 === 0);

    return (
        <GestureHandlerRootView style={styles.container} onLayout={onLayout}>
            {/* Y Axis Labels (Fixed) */}
            <View style={styles.yAxisContainer} pointerEvents="none">
                {[0, 2, 4, 6, 8, 10, 12].map(val => (
                    <Text
                        key={val}
                        style={[styles.axisLabel, { position: 'absolute', top: scaleY(val) - 10 }]}
                    >
                        {val}
                    </Text>
                ))}
            </View>

            <View style={styles.chartArea}>
                <GestureDetector gesture={composed}>
                    {/* Scroll Container (Handles TranslateX) */}
                    <Animated.View style={[styles.chartContent, scrollStyle]}>
                        {/* Layer 1: Lines/Grid (Previously Zoom Container, now just Svg) */}
                        <View>
                            <Svg width={contentWidth} height={height}>
                                {/* Vertical Grid Lines */}
                                {xTicks.map((d, i) => (
                                    <Line
                                        key={`v-${i}`}
                                        x1={scaleX(d.date)}
                                        y1={0}
                                        x2={scaleX(d.date)}
                                        y2={height - 30}
                                        stroke={colors.borderDark}
                                        strokeWidth={0.5}
                                    />
                                ))}
                                {/* Horizontal Grid Lines */}
                                {[0, 2, 4, 6, 8, 10, 12].map(v => (
                                    <Line
                                        key={`h-${v}`}
                                        x1={0}
                                        y1={scaleY(v)}
                                        x2={contentWidth}
                                        y2={scaleY(v)}
                                        stroke={colors.borderDark}
                                        strokeWidth={0.5}
                                    />
                                ))}

                                {/* Data Lines */}
                                <RenderLineSeries
                                    dataKey="Temp"
                                    color={colors.green[300]}
                                    strokeWidth={0.8}
                                />
                                <RenderLineSeries
                                    dataKey="DO"
                                    color={colors.orange[700]}
                                    strokeWidth={0.8}
                                />
                                <RenderLineSeries
                                    dataKey="pH"
                                    color={colors.blue[300]}
                                    strokeWidth={1}
                                />
                                <RenderLineSeries
                                    dataKey="Alk"
                                    color={colors.yellow[800]}
                                    strokeWidth={1.5}
                                />
                                <RenderLineSeries
                                    dataKey="Salt"
                                    color={colors.brown[900]}
                                    strokeWidth={1.5}
                                />
                                <RenderLineSeries
                                    dataKey="Clear"
                                    color={colors.blue[700]}
                                    strokeWidth={0.8}
                                />
                                <RenderLineSeries
                                    dataKey="Ammonia"
                                    color={colors.green[800]}
                                    strokeWidth={1.2}
                                />
                            </Svg>
                        </View>

                        {/* Layer 2: DOTS Container (Static Position) */}
                        <View
                            style={[
                                StyleSheet.absoluteFill,
                                { width: contentWidth, height: height },
                            ]}
                            pointerEvents="none"
                        >
                            <Svg width={contentWidth} height={height}>
                                <RenderDotSeries dataKey="Temp" color={colors.green[300]} />
                                <RenderDotSeries dataKey="DO" color={colors.orange[700]} />
                                <RenderDotSeries dataKey="pH" color={colors.blue[300]} />
                                <RenderDotSeries dataKey="Alk" color={colors.yellow[800]} />
                                <RenderDotSeries dataKey="Salt" color={colors.brown[900]} />
                                <RenderDotSeries dataKey="Clear" color={colors.blue[700]} />
                                <RenderDotSeries dataKey="Ammonia" color={colors.green[800]} />
                            </Svg>
                        </View>

                        {/* Layer 3: Text Label Container (Handles PositionX) */}
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 10,
                                height: '100%',
                            }}
                            pointerEvents="none"
                        >
                            {xTicks.map((d, i) => (
                                <AnimatedLabel
                                    key={`l-${i}`}
                                    date={d.date}
                                    baseX={scaleX(d.date)}
                                />
                            ))}
                        </View>
                    </Animated.View>
                </GestureDetector>

                {/* Tooltip Overlay (Fixed on screen or uses absolute coords from tap, simplified here) */}
                {selectedPoint && (
                    <View style={[styles.tooltipContainer, { left: 10, top: 10 }]}>
                        <View style={styles.tooltipHeader}>
                            <Text style={styles.tooltipDate}>{formatDate(selectedPoint.date)}</Text>
                            <Text style={styles.tooltipClose} onPress={handleCloseTooltip}>
                                ×
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.green[300] }]} />
                            <Text style={styles.tooltipLabel}>
                                Temp: {selectedPoint.Temp.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.orange[700] }]} />
                            <Text style={styles.tooltipLabel}>
                                DO: {selectedPoint.DO.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.blue[300] }]} />
                            <Text style={styles.tooltipLabel}>
                                pH: {selectedPoint.pH.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.yellow[800] }]} />
                            <Text style={styles.tooltipLabel}>
                                Alk: {selectedPoint.Alk.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.brown[900] }]} />
                            <Text style={styles.tooltipLabel}>
                                Salt: {selectedPoint.Salt.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.blue[700] }]} />
                            <Text style={styles.tooltipLabel}>
                                Clear: {selectedPoint.Clear.toFixed(1)}
                            </Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <View style={[styles.dot, { backgroundColor: colors.green[800] }]} />
                            <Text style={styles.tooltipLabel}>
                                Ammonia: {selectedPoint.Ammonia.toFixed(1)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
            {/* Right Axis Mask (Fixed Right) */}
            <View style={styles.yAxisContainer} pointerEvents="none" />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 400,
        flexDirection: 'row',
        backgroundColor: colors.white,
    },
    yAxisContainer: {
        width: 30,
        height: '100%',
        zIndex: 10,
        backgroundColor: `${colors.white}E6`,
    },
    chartArea: {
        flex: 1,
        overflow: 'hidden',
    },
    chartContent: {
        //
    },
    axisLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 14,
        color: colors.text,
        textAlign: 'right',
        width: '100%',
        paddingRight: 4,
    },
    axisLabelCenter: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        width: '100%',
    },
    // Tooltip Styles
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
        minWidth: 120,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingBottom: 4,
    },
    tooltipDate: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12,
        color: colors.text,
    },
    tooltipClose: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginTop: -4,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    tooltipLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 10,
        color: colors.text,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
});
