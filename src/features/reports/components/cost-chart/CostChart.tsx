import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

// Define the data interface
interface ChartData {
    value: number;
    color: string;
    label: string;
    key: string;
}

// Data matching the image percentages and colors
// Order approximates the clockwise arrangement starting from top
const DATA: ChartData[] = [
    { key: 'dark_green', value: 11.4, color: colors.green[800], label: '11.4%' },
    { key: 'sliver_orange', value: 1.5, color: colors.orange[600], label: '' }, // Small sliver
    { key: 'light_orange', value: 7.8, color: colors.orange[200], label: '7.8%' },
    { key: 'dark_blue', value: 6.1, color: colors.blue[700], label: '6.1%' },
    { key: 'light_blue', value: 4.3, color: colors.blue[400], label: '4.3%' },
    { key: 'sliver_blue', value: 2.0, color: colors.blue[50], label: '' }, // Small sliver
    { key: 'big_red', value: 45.4, color: colors.red[600], label: '45.4%' }, // Using red[600] for Thức ăn cho tôm
    { key: 'light_green', value: 21.5, color: colors.success, label: '21.5%' }, // Using success for bright green
];

interface CostChartProps {
    size?: number;
}

const CostChart = ({ size = 300 }: CostChartProps) => {
    // Dimensions
    const width = size;
    const height = size;
    const strokeWidth = 2; // White border between slices
    const radius = width / 2;
    const innerRadius = radius * 0.45; // Adjust hole size
    const outerRadius = radius;

    // D3 Generators
    const pie = shape
        .pie<ChartData>()
        .value(d => d.value)
        .sort(null) // Keep defined order
        .startAngle(0)
        .endAngle(2 * Math.PI);

    const arcGenerator = shape
        .arc<shape.PieArcDatum<ChartData>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(0);

    const arcs = pie(DATA);

    // Calculate label position
    const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const labelArcGenerator = shape
        .arc<shape.PieArcDatum<ChartData>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height}>
                <G x={width / 2} y={height / 2}>
                    {arcs.map((arc, index) => {
                        const d = arcGenerator(arc);
                        const labelCentroid = labelArcGenerator.centroid(arc);
                        const showLabel = DATA[index].label !== '';

                        return (
                            <G key={`arc-${index}`}>
                                <Path
                                    d={d || ''}
                                    fill={DATA[index].color}
                                    stroke={colors.white}
                                    strokeWidth={strokeWidth}
                                />
                                {showLabel && (
                                    <SvgText
                                        x={labelCentroid[0]}
                                        y={labelCentroid[1]}
                                        fill={colors.white}
                                        fontSize={typography.fontSize.xs}
                                        fontWeight={typography.fontWeight.bold}
                                        fontFamily={typography.fontFamily.bold}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                    >
                                        {DATA[index].label}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}
                </G>
            </Svg>

            {/* Center Info */}
            <View style={styles.centerContainer}>
                <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                <Text style={styles.totalValue}>2.24 tỉ</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    centerContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1, // Ensure it is behind if we had touch events, but actually it should be fine. Or zIndex 1 to be on top?
        // Text should be on top of the hole (which is transparent).
        // zIndex: 1.
    },
    totalLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        fontFamily: typography.fontFamily.bold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    totalValue: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.regular,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[600],
        textAlign: 'center',
    },
});

export default CostChart;
