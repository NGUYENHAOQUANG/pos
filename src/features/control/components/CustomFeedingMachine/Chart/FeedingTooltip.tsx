import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

interface FeedingTooltipProps {
  x: number;
  y: number;
  time: string;
  weight: number;
  visible: boolean;
}

export const FeedingTooltip = ({ x, y, time, weight, visible }: FeedingTooltipProps) => {
  if (!visible) return null;

  const tooltipWidth = 120;
  const tooltipHeight = 55;
  const arrowHeight = 8;
  const arrowWidth = 12;

  // Tính toán vị trí để tooltip nằm ngay trên điểm chạm, căn giữa
  const leftPos = x - tooltipWidth / 2;
  const topPos = y - tooltipHeight - arrowHeight - 5; // Cách điểm chạm 5px

  return (
    <View style={[styles.container, { left: leftPos, top: topPos }]}>
      {/* Phần hộp đen */}
      <View style={[styles.box, { width: tooltipWidth, height: tooltipHeight }]}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.valueText}>Loadcell: {weight} kg</Text>
      </View>

      {/* Phần mũi tên */}
      <View style={styles.arrowContainer}>
        <Svg width={arrowWidth} height={arrowHeight}>
          <Polygon points={`0,0 ${arrowWidth},0 ${arrowWidth / 2},${arrowHeight}`} fill="#111827" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 100,
  },
  box: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
  },
  arrowContainer: {
    marginTop: -1,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  valueText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
