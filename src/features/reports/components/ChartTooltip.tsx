import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

export interface ChartTooltipProps {
  visible: boolean;
  x: number; // SVG x coordinate
  y: number; // SVG y coordinate
  data: {
    age: string;
    measured: string;
    prediction: string;
    expectation: string;
  };
  containerStyle?: ViewStyle;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  visible,
  x,
  y,
  data,
  containerStyle,
}) => {
  if (!visible) return null;

  const tooltipWidth = 200;
  const tooltipHeight = 120;
  const arrowSize = 8;

  // Position tooltip above the point, centered horizontally
  const tooltipX = x - tooltipWidth / 2;
  const tooltipY = y - tooltipHeight - arrowSize - 10;

  return (
    <View style={[styles.container, containerStyle]} pointerEvents="none">
      {/* Tooltip background */}
      <View
        style={[
          styles.tooltip,
          {
            left: Math.max(10, Math.min(tooltipX, 350 - tooltipWidth)),
            top: Math.max(10, tooltipY),
          },
        ]}
      >
        {/* Header with blue background */}
        <View style={styles.header}>
          <Text style={styles.title}>Tuổi tôm: {data.age}</Text>
        </View>
        
        {/* Data rows */}
        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Giá trị đo:</Text>
            <Text style={styles.dataValue}>{data.measured}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Dự đoán:</Text>
            <Text style={styles.dataValue}>{data.prediction}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Kì vọng:</Text>
            <Text style={styles.dataValue}>{data.expectation}</Text>
          </View>
        </View>
      </View>

      {/* Arrow pointing to point */}
      <Svg
        style={[
          styles.arrowContainer,
          {
            left: x - arrowSize,
            top: y - arrowSize - 10,
          },
        ]}
      >
        <Polygon
          points={`0,${arrowSize} ${arrowSize},0 ${arrowSize * 2},${arrowSize}`}
          fill={colors.white}
          stroke={colors.gray[200]}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  dataContainer: {
    padding: spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dataLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  dataValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  arrowContainer: {
    position: 'absolute',
    width: 16,
    height: 8,
  },
});

