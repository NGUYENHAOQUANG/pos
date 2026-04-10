import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/styles/colors';
import { GraphDataPoint } from '@/features/menu/types/shrimpPrice.types';
import { generateBezierPath } from '@/features/menu/utils/shrimpPriceUtils';

interface MiniSparklineProps {
    data: GraphDataPoint[];
    theme: Colors;
}

/** Tiny sparkline chart rendered inside species cards */
export const MiniSparkline: React.FC<MiniSparklineProps> = ({ data, theme }) => {
    const w = 140;
    const h = 30;
    if (!data || data.length === 0) return null;

    const pastData = data.filter(d => !d.isPrediction);
    if (pastData.length === 0) return null;

    const minVal = Math.min(...pastData.map(d => d.value)) * 0.95;
    const maxVal = Math.max(...pastData.map(d => d.value)) * 1.05;

    const strokeWidth = 2;
    const paddingHorizontal = 4;
    const paddingVertical = 6;

    const points = pastData.map((d, i) => {
        const x = paddingHorizontal + (i / (pastData.length - 1)) * (w - paddingHorizontal * 2);
        const y =
            maxVal === minVal
                ? h / 2
                : h -
                  paddingVertical -
                  ((d.value - minVal) / (maxVal - minVal)) * (h - paddingVertical * 2);
        return { x, y };
    });

    const path = generateBezierPath(points);

    return (
        <Svg width={w} height={h}>
            <Path
                d={path}
                stroke={theme.primary}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.6}
            />
        </Svg>
    );
};
