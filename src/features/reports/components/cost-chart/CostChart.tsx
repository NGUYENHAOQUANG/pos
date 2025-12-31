import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CostItem } from './costChartData';

interface CostChartProps {
    size?: number;
    data: CostItem[];
    totalDisplay?: string;
}

const CostChart = ({ size = 300, data, totalDisplay = '0' }: CostChartProps) => {
    // Dimensions
    const width = size;
    const height = size;
    const strokeWidth = 2; // White border between slices
    const radius = width / 2;
    const innerRadius = radius * 0.45; // Adjust hole size
    const outerRadius = radius;

    // D3 Generators
    const pie = shape
        .pie<CostItem>()
        .value(d => d.value)
        .sort(null) // Keep defined order
        .startAngle(0)
        .endAngle(2 * Math.PI);

    const arcGenerator = shape
        .arc<shape.PieArcDatum<CostItem>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(0);

    const arcs = pie(data);

    // Calculate label position
    const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const labelArcGenerator = shape
        .arc<shape.PieArcDatum<CostItem>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height}>
                <G x={width / 2} y={height / 2}>
                    {arcs.map((arc, index) => {
                        const d = arcGenerator(arc);
                        const labelCentroid = labelArcGenerator.centroid(arc);
                        const item = data[index];
                        const showLabel = item.percentage >= 3; // Show label if > 3% or manually checked

                        return (
                            <G key={`arc-${index}`}>
                                <Path
                                    d={d || ''}
                                    fill={item.color}
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
                                        {`${item.percentage}%`}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}
                </G>
            </Svg>

            {/* Center Info */}
            <View style={styles.centerContainer}>
                <View
                    style={{
                        width: innerRadius * 2,
                        height: innerRadius * 2,
                        borderRadius: innerRadius,
                        backgroundColor: colors.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                    <Text style={styles.totalValue}>{totalDisplay}</Text>
                </View>
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
        zIndex: 1,
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
