import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors, typography } from '@/styles';
import { HarvestChartData } from './harvestData';

interface ChartProps {
    data: HarvestChartData[];
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ data, chartWidth, chartHeight }) => {
    // Process Data
    const processedData = useMemo(() => {
        const maxValue = Math.max(...data.map(d => d.yield));
        const roundMax = Math.ceil(maxValue / 10) * 10 || 10;

        // Setup 4 steps
        const step = roundMax / 4;
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
    const PADDING_LEFT = 45; // increased space for y-axis labels
    const PADDING_RIGHT = 10;

    const drawWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
    const drawHeight = chartHeight - PADDING_TOP - PADDING_BOTTOM;

    // Helper functions
    const getY = (value: number) => {
        return PADDING_TOP + drawHeight - (value / Y_MAX) * drawHeight;
    };

    const getX = (index: number) => {
        const stepLength = drawWidth / data.length;
        return PADDING_LEFT + index * stepLength + stepLength / 2; // Center of the bar allocation
    };

    const barWidth = 32;

    return (
        <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
                {/* Horizontal Grid Lines */}
                {yAxisLabels.map(value => {
                    const y = getY(value);
                    return (
                        <Line
                            key={`grid-${value}`}
                            x1={PADDING_LEFT}
                            y1={y}
                            x2={chartWidth - PADDING_RIGHT}
                            y2={y}
                            stroke={colors.gray[100]}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Bars */}
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
                                y={y - 8} // Slightly above the bar
                                fill={colors.text}
                                fontSize={10}
                                fontWeight={typography.fontWeight.medium.toString()}
                                textAnchor="middle"
                            >
                                {item.yield.toFixed(2)}
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

                {/* Y Axis Labels */}
                {yAxisLabels.map(value => {
                    const y = getY(value);
                    return (
                        <SvgText
                            key={`y-label-${value}`}
                            x={PADDING_LEFT - 8}
                            y={y + 4} // Optical vertical alignment
                            fill={colors.gray[500]}
                            fontSize={10}
                            textAnchor="end"
                        >
                            {/* Chuyển dấu chấm (ví dụ: 37.5) thành dấu phẩy (37,5) cho giống với hình mẫu */}
                            {value % 1 === 0
                                ? value.toString()
                                : value.toFixed(1).replace('.', ',')}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
});
