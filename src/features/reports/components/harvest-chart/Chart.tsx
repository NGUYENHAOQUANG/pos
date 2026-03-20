import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors, typography } from '@/styles';
export interface HarvestChartData {
    pond: string;
    yield: number;
}

interface ChartProps {
    data: HarvestChartData[];
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ data, chartWidth, chartHeight }) => {
    // Process Data
    const processedData = useMemo(() => {
        const maxValue = Math.max(...data.map(d => d.yield));

        // Find a nice integer step for 4 intervals (5 tick marks including 0)
        const INTERVALS = 4;
        const rawStep = (maxValue || 10) / INTERVALS;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
        const niceMultiples = [1, 1.5, 2, 2.5, 3, 5, 10];
        let step = niceMultiples[niceMultiples.length - 1] * magnitude;
        for (const m of niceMultiples) {
            if (m * magnitude >= rawStep) {
                step = m * magnitude;
                break;
            }
        }
        // Ensure step is integer
        step = Math.max(1, Math.ceil(step));

        const roundMax = step * INTERVALS;

        const yAxisLabels = [
            roundMax,
            roundMax - step,
            roundMax - step * 2,
            roundMax - step * 3,
            0,
        ];

        return {
            Y_MAX: roundMax,
            yAxisLabels,
        };
    }, [data]);

    const { Y_MAX, yAxisLabels } = processedData;

    // Dimensions
    const PADDING_TOP = 20;
    const PADDING_BOTTOM = 25; // space for x-axis labels
    const PADDING_LEFT = 50;
    const PADDING_RIGHT = 10;

    // Use dynamic width to prevent squishing when data is large
    const MIN_BAR_STEP = 70;
    const SCROLL_OFFSET = 16; // Extra left padding inside scroll for first bar
    const actualWidth = Math.max(
        chartWidth,
        data.length * MIN_BAR_STEP + PADDING_LEFT + PADDING_RIGHT + SCROLL_OFFSET
    );

    const drawWidth = actualWidth - PADDING_LEFT - PADDING_RIGHT;
    const drawHeight = chartHeight - PADDING_TOP - PADDING_BOTTOM;

    // Helper functions
    const getY = (value: number) => {
        return PADDING_TOP + drawHeight - (value / Y_MAX) * drawHeight;
    };

    const getX = (index: number) => {
        const effectiveDataLength = Math.max(data.length, 5);
        const stepLength = drawWidth / effectiveDataLength;
        return PADDING_LEFT + SCROLL_OFFSET + index * stepLength + stepLength / 2;
    };

    const barWidth = 32;

    return (
        <View style={styles.chartContainer}>
            <View style={{ position: 'relative', width: '100%' }}>
                {/* Sticky Y Axis Panel */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: chartHeight - PADDING_BOTTOM + 20, // ensure label visibility
                        width: PADDING_LEFT,
                        zIndex: 10,
                        backgroundColor: colors.white,
                    }}
                    pointerEvents="none"
                >
                    <Svg width={PADDING_LEFT} height={chartHeight} style={{ overflow: 'visible' }}>
                        {/* Y Axis Labels */}
                        {yAxisLabels.map(value => {
                            const y = getY(value);
                            return (
                                <SvgText
                                    key={`y-label-${value}`}
                                    x={16}
                                    y={y + 4} // Optical vertical alignment
                                    fill={colors.gray[500]}
                                    fontSize={12}
                                    textAnchor="start"
                                >
                                    {value % 1 === 0
                                        ? value.toString()
                                        : value.toFixed(1).replace('.', ',')}
                                </SvgText>
                            );
                        })}
                    </Svg>
                </View>

                {/* Scrollable Bars Area */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Svg width={actualWidth} height={chartHeight}>
                        {/* Horizontal Grid Lines */}
                        {yAxisLabels.map(value => {
                            const y = getY(value);
                            return (
                                <Line
                                    key={`grid-${value}`}
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={actualWidth - PADDING_RIGHT}
                                    y2={y}
                                    stroke={colors.gray[100]}
                                    strokeWidth={1}
                                />
                            );
                        })}

                        {/* Bars and Labels */}
                        {data.map((item, index) => {
                            const x = getX(index);
                            const y = getY(item.yield);
                            const barHeight = PADDING_TOP + drawHeight - y;

                            return (
                                <React.Fragment key={`bar-${index}`}>
                                    {/* The Bar */}
                                    <Rect
                                        x={x - barWidth / 2}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={colors.orange[900]}
                                        rx={2}
                                        ry={2}
                                    />

                                    {/* Value Label on top of the bar */}
                                    <SvgText
                                        x={x}
                                        y={y - 8}
                                        fill={colors.textSecondary}
                                        fontSize={12}
                                        fontWeight={typography.fontWeight.medium.toString()}
                                        textAnchor="middle"
                                    >
                                        {item.yield.toFixed(3)}
                                    </SvgText>

                                    {/* Category Label below the X axis */}
                                    <SvgText
                                        x={x}
                                        y={PADDING_TOP + drawHeight + 16}
                                        fill={colors.gray[600]}
                                        fontSize={12}
                                        textAnchor="middle"
                                    >
                                        {item.pond}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: {
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
});
