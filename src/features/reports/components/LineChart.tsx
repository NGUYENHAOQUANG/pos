import { colors, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { ChartTooltip } from './ChartTooltip';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CHART_HEIGHT = 180;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 15;
const PADDING_TOP = 15;
const PADDING_BOTTOM = 35;

export interface ChartDataPoint {
  x: number;
  y: number;
}

export interface ChartLine {
  data: ChartDataPoint[];
  color: string;
  label: string;
  isDashed?: boolean;
}

export interface TooltipData {
  age: string;
  measured: string;
  prediction: string;
  expectation: string;
}

export interface LineChartProps {
  lines: ChartLine[];
  xAxisLabels: string[];
  yAxisMax?: number;
  yAxisStep?: number;
  containerStyle?: ViewStyle;
  getTooltipData?: (xIndex: number) => TooltipData;
}

export const LineChart: React.FC<LineChartProps> = ({
  lines,
  xAxisLabels,
  yAxisMax = 80,
  yAxisStep = 10,
  containerStyle,
  getTooltipData,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    xIndex: number;
  } | null>(null);

  const chartWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const yScale = chartHeight / yAxisMax;
  const xScale = chartWidth / Math.max(1, xAxisLabels.length - 1);

  const yAxisLabels: number[] = [];
  for (let i = 0; i <= yAxisMax; i += yAxisStep) {
    yAxisLabels.push(i);
  }

  const convertToSVG = (point: ChartDataPoint): { x: number; y: number } => {
    return {
      x: PADDING_LEFT + point.x * xScale,
      y: PADDING_TOP + chartHeight - point.y * yScale,
    };
  };

  const generatePath = (data: ChartDataPoint[]): string => {
    if (data.length === 0) return '';

    const firstPoint = convertToSVG(data[0]);
    let path = `M ${firstPoint.x} ${firstPoint.y}`;

    for (let i = 1; i < data.length; i++) {
      const point = convertToSVG(data[i]);
      path += ` L ${point.x} ${point.y}`;
    }

    return path;
  };

  const handlePointPress = (point: ChartDataPoint, xIndex: number) => {
    const svgPoint = convertToSVG(point);
    setSelectedPoint({
      x: svgPoint.x,
      y: svgPoint.y,
      xIndex,
    });
  };

  const handleChartPress = () => {
    setSelectedPoint(null);
  };

  const tooltipData = selectedPoint && getTooltipData ? getTooltipData(selectedPoint.xIndex) : null;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {/* Grid lines */}
            {yAxisLabels.map((value, index) => {
              const y = PADDING_TOP + chartHeight - value * yScale;
              return (
                <Line
                  key={`grid-${index}`}
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={PADDING_LEFT + chartWidth}
                  y2={y}
                  stroke={colors.gray[100]}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Y-axis labels */}
            {yAxisLabels.map((value, index) => {
              const y = PADDING_TOP + chartHeight - value * yScale;
              return (
                <SvgText
                  key={`y-label-${index}`}
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  fontSize={typography.fontSize.xs}
                  fill={colors.textSecondary}
                  textAnchor="end"
                >
                  {value}
                </SvgText>
              );
            })}

            {/* Chart lines */}
            {lines.map((line, lineIndex) => {
              const path = generatePath(line.data);
              return (
                <Path
                  key={`line-${lineIndex}`}
                  d={path}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.isDashed ? 2 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={line.isDashed ? '4 4' : '0'}
                  opacity={line.isDashed ? 0.8 : 1}
                />
              );
            })}

            {/* Data points */}
            {lines.map((line, lineIndex) =>
              line.data.map((point, pointIndex) => {
                const svgPoint = convertToSVG(point);
                return (
                  <Circle
                    key={`point-${lineIndex}-${pointIndex}`}
                    cx={svgPoint.x}
                    cy={svgPoint.y}
                    r={5}
                    fill={line.color}
                    stroke={colors.white}
                    strokeWidth={2.5}
                  />
                );
              })
            )}

            {/* X-axis labels */}
            {xAxisLabels.map((label, index) => {
              const x = PADDING_LEFT + index * xScale;
              return (
                <SvgText
                  key={`x-label-${index}`}
                  x={x}
                  y={CHART_HEIGHT - PADDING_BOTTOM + 20}
                  fontSize={typography.fontSize.xs}
                  fill={colors.textSecondary}
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              );
            })}
          </Svg>

          {lines.map((line, lineIndex) =>
            line.data.map((point, pointIndex) => {
              const svgPoint = convertToSVG(point);
              const xIndex = lineIndex === 0 ? pointIndex : -1;
              if (xIndex < 0) return null;
              return (
                <Pressable
                  key={`touchable-${lineIndex}-${pointIndex}`}
                  onPress={() => handlePointPress(point, xIndex)}
                  hitSlop={10}
                  style={[
                    styles.pointTouchable,
                    {
                      left: svgPoint.x - 20,
                      top: svgPoint.y - 20,
                    },
                  ]}
                />
              );
            })
          )}
        </View>

        {selectedPoint && (
          <TouchableOpacity
            style={styles.chartTouchable}
            activeOpacity={1}
            onPress={handleChartPress}
          />
        )}

        {/* Tooltip */}
        {selectedPoint && tooltipData && (
          <ChartTooltip visible={true} x={selectedPoint.x} y={selectedPoint.y} data={tooltipData} />
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {lines.map((line, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: line.color }]} />
            <Text style={styles.legendText}>{line.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 0,
    position: 'relative',
  },
  chartWrapper: {
    position: 'relative',
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
  chartContainer: {
    position: 'relative',
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
  chartTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  pointTouchable: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
