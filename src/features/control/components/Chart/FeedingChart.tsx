import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Line, Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import { FeedingTooltip } from './FeedingTooltip';
import { colors } from '@/styles';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedView = Animated.createAnimatedComponent(View);

const ACTUAL_DATA = [
  { time: '00:00', value: 0 },
  { time: '00:30', value: 0 },
  { time: '01:00', value: 4 },
  { time: '01:18', value: 2.5 },
  { time: '01:30', value: 4 },
  { time: '02:00', value: 2.3 },
  { time: '02:30', value: 2.3 },
  { time: '03:00', value: 1.2 },
  { time: '03:30', value: 0.6 },
  { time: '04:30', value: 0 },
  { time: '05:30', value: 4 },
  { time: '06:00', value: 3.5 },
];

const X_LABELS = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

const Y_MAX = 4;
const Y_STEP = 0.5;
const CHART_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;
const AXIS_MARGIN_TOP = 10;

export default function FeedingChart() {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const cursorAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const PADDING_LEFT = 35;
  const PADDING_RIGHT = 20;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 50;

  const chartWidth = SCREEN_WIDTH - 32 - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const yLabels = [];
  for (let i = 0; i <= Y_MAX; i += Y_STEP) {
    yLabels.push(i);
  }

  const getX = (index: number, total: number) => (index / (total - 1)) * chartWidth + PADDING_LEFT;
  const getY = (value: number) => chartHeight - (value / Y_MAX) * chartHeight + PADDING_TOP;

  useEffect(() => {
    if (selectedPoint) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: { x: selectedPoint.x, y: selectedPoint.y },
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPoint, cursorAnim, opacityAnim]);

  const createStepPath = () => {
    let path = `M ${getX(0, ACTUAL_DATA.length)} ${getY(ACTUAL_DATA[0].value)}`;
    for (let i = 0; i < ACTUAL_DATA.length - 1; i++) {
      const x2 = getX(i + 1, ACTUAL_DATA.length);
      const y1 = getY(ACTUAL_DATA[i].value);
      const y2 = getY(ACTUAL_DATA[i + 1].value);
      path += ` L ${x2} ${y1} L ${x2} ${y2}`;
    }
    return path;
  };

  const handleTouch = (evt: any) => {
    const locationX = evt.nativeEvent.locationX;
    let minDistance = 1000;
    let nearestIndex = -1;

    ACTUAL_DATA.forEach((point, index) => {
      const px = getX(index, ACTUAL_DATA.length);
      const dist = Math.abs(px - locationX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== -1) {
      const point = ACTUAL_DATA[nearestIndex];
      setSelectedPoint({
        x: getX(nearestIndex, ACTUAL_DATA.length),
        y: getY(point.value),
        value: point.value,
        time: point.time,
      });
    }
  };

  const verticalLineStyle = {
    transform: [{ translateX: cursorAnim.x }],
    opacity: opacityAnim,
  };

  const horizontalLineStyle = {
    transform: [{ translateY: cursorAnim.y }],
    opacity: opacityAnim,
  };

  const cursorPointStyle = {
    transform: [{ translateX: cursorAnim.x }, { translateY: cursorAnim.y }],
    opacity: opacityAnim,
  };

  const tooltipAnimatedStyle = [
    styles.tooltipContainer,
    {
      transform: [{ translateX: cursorAnim.x }, { translateY: cursorAnim.y }],
      opacity: opacityAnim,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khối Lượng Thức Ăn Thả Thực Tế</Text>
      <Text style={styles.subtitle}>Đo bằng cảm biến cân nặng (Loadcell)</Text>

      <View style={styles.chartWrapper}>
        <TouchableOpacity activeOpacity={1} onPress={handleTouch} style={styles.touchArea}>
          <Svg width={SCREEN_WIDTH - 32} height={CHART_HEIGHT}>
            {yLabels.map(val => (
              <G key={`grid-y-${val}`}>
                <Line
                  x1={PADDING_LEFT}
                  y1={getY(val)}
                  x2={chartWidth + PADDING_LEFT}
                  y2={getY(val)}
                  stroke={colors.gray[100]}
                  strokeWidth={1}
                />
                <SvgText
                  x={PADDING_LEFT - 8}
                  y={getY(val) + 3}
                  fill={colors.text}
                  fontSize="10"
                  textAnchor="end"
                >
                  {val % 1 === 0 ? val : val.toFixed(1)}
                </SvgText>
              </G>
            ))}

            <Line
              x1={PADDING_LEFT}
              y1={chartHeight + PADDING_TOP + AXIS_MARGIN_TOP}
              x2={chartWidth + PADDING_LEFT}
              y2={chartHeight + PADDING_TOP + AXIS_MARGIN_TOP}
              stroke={colors.gray[300]}
              strokeWidth={1}
            />

            {X_LABELS.map((label, index) => {
              const xPos = (index / (X_LABELS.length - 1)) * chartWidth + PADDING_LEFT;
              const chartBottom = chartHeight + PADDING_TOP;
              const axisY = chartBottom + AXIS_MARGIN_TOP;
              const tickHalf = 4;
              const textMargin = 12;

              return (
                <G key={`grid-x-${index}`}>
                  {/* Dùng gray[100] thay cho gridLine */}
                  <Line
                    x1={xPos}
                    y1={PADDING_TOP}
                    x2={xPos}
                    y2={chartBottom}
                    stroke={colors.gray[100]}
                    strokeDasharray="4 4"
                  />

                  <Line
                    x1={xPos}
                    y1={axisY - tickHalf}
                    x2={xPos}
                    y2={axisY + tickHalf}
                    stroke={colors.gray[400]}
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={xPos}
                    y={axisY + tickHalf + textMargin}
                    fill={colors.textSecondary}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            })}

            <Rect
              x={getX(4, ACTUAL_DATA.length) - 8}
              y={getY(2.5)}
              width={16}
              height={chartHeight + PADDING_TOP - getY(2.5)}
              fill={colors.primary}
            />
            <Rect
              x={getX(11, ACTUAL_DATA.length) - 8}
              y={getY(3.5)}
              width={16}
              height={chartHeight + PADDING_TOP - getY(3.5)}
              fill={colors.primary}
            />

            <Path d={createStepPath()} fill="none" stroke={colors.orange} strokeWidth="2" />
            {ACTUAL_DATA.map((point, i) => (
              <Circle
                key={i}
                cx={getX(i, ACTUAL_DATA.length)}
                cy={getY(point.value)}
                r={3}
                fill={colors.orange}
                stroke={colors.white}
                strokeWidth={1}
              />
            ))}

            <AnimatedG style={verticalLineStyle}>
              <Line
                x1={0}
                y1={PADDING_TOP}
                x2={0}
                y2={chartHeight + PADDING_TOP + AXIS_MARGIN_TOP}
                stroke={colors.gray[600]}
                strokeWidth={1}
              />
            </AnimatedG>

            <AnimatedG style={horizontalLineStyle}>
              <Line
                x1={PADDING_LEFT}
                y1={0}
                x2={chartWidth + PADDING_LEFT}
                y2={0}
                stroke={colors.gray[600]}
                strokeWidth={1}
              />
            </AnimatedG>

            <AnimatedG style={cursorPointStyle}>
              <Circle
                cx={0}
                cy={0}
                r={4}
                fill={colors.orange}
                stroke={colors.white}
                strokeWidth={2}
              />
            </AnimatedG>
          </Svg>

          {selectedPoint && (
            <AnimatedView style={tooltipAnimatedStyle}>
              <FeedingTooltip
                visible={true}
                x={0}
                y={0}
                time={selectedPoint.time}
                weight={selectedPoint.value}
              />
            </AnimatedView>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.legendDashActual} />
          <Text style={styles.legendText}>Đo thực tế</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendCirclePlan} />
          <Text style={styles.legendText}>Theo kế hoạch</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  touchArea: {
    position: 'relative',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDashActual: {
    width: 16,
    height: 2,
    backgroundColor: colors.orange,
  },
  legendCirclePlan: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
