import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect, G, Text as SvgText, Polygon } from 'react-native-svg';
import { colors, spacing } from '@/styles';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    DAY_MARKS,
    DAY_LABELS,
    TOTAL_DAYS,
    DIVIDER_DAY,
    PADDING_LEFT,
    PADDING_TOP,
    ORANGE_DATA_HISTORICAL,
    BLUE_DATA_HISTORICAL,
    BLUE_DATA_FORECAST,
    Y_MAX_CHART1,
    getYAxisLabels,
} from './chartData';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight }) => {
    // Helper functions
    const getX = (day: number) => (day / TOTAL_DAYS) * chartWidth + PADDING_LEFT;
    const getY = (value: number) =>
        chartHeight - (value / Y_MAX_CHART1) * chartHeight + PADDING_TOP;

    // Create smooth bezier curve path for blue line - using Catmull-Rom spline
    const createBluePath = () => {
        const allBlueData = [...BLUE_DATA_HISTORICAL, ...BLUE_DATA_FORECAST.slice(1)];
        if (allBlueData.length < 2) return '';

        // Start path
        const firstX = getX(allBlueData[0].day);
        const firstY = getY(allBlueData[0].value);
        let path = `M ${firstX} ${firstY}`;

        // Create smooth curve through all points
        for (let i = 0; i < allBlueData.length - 1; i++) {
            const p0 = i > 0 ? allBlueData[i - 1] : allBlueData[i];
            const p1 = allBlueData[i];
            const p2 = allBlueData[i + 1];
            const p3 = i < allBlueData.length - 2 ? allBlueData[i + 2] : allBlueData[i + 1];

            const x0 = getX(p0.day);
            const y0 = getY(p0.value);
            const x1 = getX(p1.day);
            const y1 = getY(p1.value);
            const x2 = getX(p2.day);
            const y2 = getY(p2.value);
            const x3 = getX(p3.day);
            const y3 = getY(p3.value);

            // Catmull-Rom to Cubic Bezier conversion
            // Control points calculated to create smooth curve
            const tension = 0.5; // Adjust curve smoothness
            const cp1x = x1 + ((x2 - x0) / 6) * tension;
            const cp1y = y1 + ((y2 - y0) / 6) * tension;
            const cp2x = x2 - ((x3 - x1) / 6) * tension;
            const cp2y = y2 - ((y3 - y1) / 6) * tension;

            // Use cubic bezier curve
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        }

        return path;
    };

    const dividerX = getX(DIVIDER_DAY);

    // Calculate Y position for X-axis: at middle of range 30-40
    // If dividing into 4 parts: 0, Y_MAX/4, Y_MAX/2, 3*Y_MAX/4, Y_MAX
    // Range 30-40 corresponds to range from 3*Y_MAX/4 to Y_MAX
    // Middle of that range: 3*Y_MAX/4 + Y_MAX/8 = 7*Y_MAX/8
    const axisX_Value = (7 * Y_MAX_CHART1) / 8; // Middle of upper range (30-40)
    const axisX_Y = getY(axisX_Value);

    return (
        <View style={styles.container}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                {/* Grid lines (horizontal, light gray) - divide max into 4 parts */}
                {getYAxisLabels().map(value => {
                    const y = getY(value);
                    return (
                        <Line
                            key={`grid-${value}`}
                            x1={PADDING_LEFT}
                            y1={y}
                            x2={PADDING_LEFT + chartWidth}
                            y2={y}
                            stroke={colors.gray[200]}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Red divider axis X (horizontal X-axis at position avg - (avg/4)/2) - split into 2 parts */}
                {/* Left part: error color */}
                <Line
                    x1={PADDING_LEFT}
                    y1={axisX_Y}
                    x2={dividerX}
                    y2={axisX_Y}
                    stroke={colors.error}
                    strokeWidth={2}
                />
                {/* Right part: textSecondary color */}
                <Line
                    x1={dividerX}
                    y1={axisX_Y}
                    x2={PADDING_LEFT + chartWidth}
                    y2={axisX_Y}
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                />

                {/* Left arrow (pointing left) */}
                <Polygon
                    points={`${PADDING_LEFT},${axisX_Y} ${PADDING_LEFT + 8},${axisX_Y - 4} ${
                        PADDING_LEFT + 8
                    },${axisX_Y + 4}`}
                    fill="#FF0000"
                />

                {/* Right arrow (pointing right) */}
                <Polygon
                    points={`${PADDING_LEFT + chartWidth},${axisX_Y} ${
                        PADDING_LEFT + chartWidth - 8
                    },${axisX_Y - 4} ${PADDING_LEFT + chartWidth - 8},${axisX_Y + 4}`}
                    fill={colors.textSecondary}
                />

                {/* Labels for divider */}
                <G>
                    {/* Left text */}
                    <SvgText
                        x={PADDING_LEFT + 15}
                        y={axisX_Y - 8}
                        fill="#FF0000"
                        fontSize={10}
                        textAnchor="start"
                        fontWeight="400"
                    >
                        Dữ liệu từ đầu vụ tới hiện tại
                    </SvgText>

                    {/* Right text */}
                    <SvgText
                        x={PADDING_LEFT + chartWidth - 15}
                        y={axisX_Y - 8}
                        fill="#FF0000"
                        fontSize={10}
                        textAnchor="end"
                        fontWeight="400"
                    >
                        Dữ liệu dự báo ngày tiếp theo
                    </SvgText>
                </G>

                {/* Red vertical line at divider position (vertical line to divide data) */}
                <Line
                    x1={dividerX}
                    y1={PADDING_TOP}
                    x2={dividerX}
                    y2={PADDING_TOP + chartHeight}
                    stroke={colors.error}
                    strokeWidth={2}
                    strokeLinecap="round"
                />

                {/* Blue line (historical + forecast) - smooth bezier curve */}
                <Path
                    d={createBluePath()}
                    fill="none"
                    stroke="#003EB3"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Orange line - drawn as stacked rectangles (step chart) like SVG */}
                {ORANGE_DATA_HISTORICAL.filter(point => point.day <= DIVIDER_DAY).map(
                    (point, index) => {
                        if (index === 0) return null;

                        const prevPoint = ORANGE_DATA_HISTORICAL[index - 1];
                        const x1 = getX(prevPoint.day);
                        const x2 = getX(point.day);
                        const y1 = getY(prevPoint.value);
                        const y2 = getY(point.value);

                        // Draw 2 rectangles to create step effect:
                        // 1. Horizontal rectangle (from x1 to x2 at level y1)
                        // 2. Vertical rectangle (from y1 to y2 at position x2)

                        return (
                            <G key={`orange-step-${point.day}`}>
                                {/* Horizontal rectangle */}
                                <Rect x={x1} y={y1 - 2} width={x2 - x1} height={4} fill="#FA541C" />
                                {/* Vertical rectangle */}
                                {y2 !== y1 && (
                                    <Rect
                                        x={x2 - 2}
                                        y={Math.min(y1, y2)}
                                        width={4}
                                        height={Math.abs(y2 - y1)}
                                        fill="#FA541C"
                                    />
                                )}
                            </G>
                        );
                    }
                )}

                {/* X-axis labels - 11 day markers with dd/mm/yyyy format, rotated -15 degrees */}
                {DAY_MARKS.map((day, index) => {
                    const x = getX(day);
                    const y = PADDING_TOP + chartHeight + 20;
                    return (
                        <SvgText
                            key={`x-label-${day}`}
                            x={x}
                            y={y}
                            fill={colors.textSecondary}
                            fontSize={10}
                            textAnchor="middle"
                            transform={`rotate(-15 ${x} ${y})`}
                        >
                            {DAY_LABELS[index]}
                        </SvgText>
                    );
                })}

                {/* Y-axis labels - divide max into 4 equal parts */}
                {getYAxisLabels().map(value => {
                    const y = getY(value);
                    return (
                        <SvgText
                            key={`y-label-${value}`}
                            x={PADDING_LEFT - 10}
                            y={y + 4}
                            fill={colors.textSecondary}
                            fontSize={10}
                            textAnchor="end"
                        >
                            {Math.round(value * 100) / 100}
                        </SvgText>
                    );
                })}

                {/* Y-axis title: "Khối lượng (Tấn)" - rotated 90 degrees */}
                <SvgText
                    x={12}
                    y={PADDING_TOP + chartHeight / 2}
                    fill={colors.text}
                    fontSize={14}
                    fontWeight="400"
                    textAnchor="middle"
                    transform={`rotate(-90 12 ${PADDING_TOP + chartHeight / 2})`}
                >
                    Khối lượng (Tấn)
                </SvgText>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
});
