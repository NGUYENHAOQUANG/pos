import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import * as shape from 'd3-shape';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CostItem } from './costChartData';

interface CostChartProps {
    size?: number; // Currently passed as 300
    data: CostItem[];
    totalDisplay?: string;
}

const CostChart = ({ size = 300, data, totalDisplay = '0' }: CostChartProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Make the outer container width match the card content width (screen - 32px padding).
    const screenWidth = Dimensions.get('window').width;
    const containerWidth = screenWidth - 32;

    // The SVG matches the container perfectly
    const svgWidth = containerWidth;
    const svgHeight = size;
    const strokeWidth = 2; // White border between slices
    const radius = size / 2;

    // Decrease maxRadius to leave room for the tooltip inside the bounding box
    const maxRadius = radius - 15;
    const selectedOuterRadius = maxRadius;
    const outerRadius = maxRadius * 0.95;
    const innerRadius = maxRadius * 0.55;

    // D3 Generators
    const pie = shape
        .pie<CostItem>()
        .value(d => d.value)
        .sort(null) // Keep defined order
        .startAngle(0)
        .endAngle(2 * Math.PI);

    const arcs = pie(data);

    const getTooltipCenter = (arc: shape.PieArcDatum<CostItem>) => {
        const tooltipRadius = innerRadius + (selectedOuterRadius - innerRadius) / 2;
        const tooltipArcGenerator = shape
            .arc<shape.PieArcDatum<CostItem>>()
            .innerRadius(tooltipRadius)
            .outerRadius(tooltipRadius);
        const centroid = tooltipArcGenerator.centroid(arc);

        return {
            x: containerWidth / 2 + centroid[0],
            y: svgHeight / 2 + centroid[1],
            cx: centroid[0],
            cy: centroid[1],
        };
    };

    return (
        <TouchableWithoutFeedback onPress={() => setSelectedIndex(null)}>
            <View style={[styles.container, { width: containerWidth, height: svgHeight }]}>
                <Svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
                    <G x={svgWidth / 2} y={svgHeight / 2}>
                        {arcs.map((arc, index) => {
                            const isSelected = selectedIndex === index;

                            const arcGenerator = shape
                                .arc<shape.PieArcDatum<CostItem>>()
                                .innerRadius(innerRadius)
                                .outerRadius(isSelected ? selectedOuterRadius : outerRadius)
                                .padAngle(0);

                            const d = arcGenerator(arc);
                            const item = data[index];

                            return (
                                <G key={`arc-${index}`}>
                                    <Path
                                        d={d || ''}
                                        fill={item.color}
                                        stroke={colors.white}
                                        strokeWidth={strokeWidth}
                                        onPress={() => setSelectedIndex(isSelected ? null : index)}
                                    />
                                </G>
                            );
                        })}
                    </G>
                </Svg>

                {/* Center Info */}
                <View style={styles.centerContainer} pointerEvents="none">
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
                        <Text style={styles.totalLabel}>Tổng chi phí</Text>
                        <Text style={styles.totalValue}>{totalDisplay}</Text>
                    </View>
                </View>

                {/* Tooltip */}
                {selectedIndex !== null &&
                    (() => {
                        const pos = getTooltipCenter(arcs[selectedIndex]);

                        const isRightSide = pos.cx > 0;
                        const isBottomSide = pos.cy > 0;

                        // Prevent pushing right outside container bound
                        const marginSafeguard = 100;

                        // Determine if there's enough room to naturally push outwards
                        let anchorLeft: number | undefined;
                        let anchorRight: number | undefined;

                        if (isRightSide) {
                            // Normally point outwards from right slice (grow right -> anchor left)
                            if (pos.x + marginSafeguard < containerWidth) {
                                anchorLeft = pos.x;
                            } else {
                                // Too close to right crop, point inwards (grow left -> anchor right)
                                anchorRight = containerWidth - pos.x;
                            }
                        } else {
                            // Normally point outwards from left slice (grow left -> anchor right)
                            if (pos.x - marginSafeguard > 0) {
                                anchorRight = containerWidth - pos.x;
                            } else {
                                // Too close to left crop, point inwards (grow right -> anchor left)
                                anchorLeft = pos.x;
                            }
                        }

                        return (
                            <View
                                style={[
                                    styles.tooltipWrapper,
                                    {
                                        left: anchorLeft,
                                        right: anchorRight,

                                        top: isBottomSide ? pos.y : undefined,
                                        bottom: !isBottomSide ? svgHeight - pos.y : undefined,
                                    },
                                ]}
                                pointerEvents="none"
                            >
                                <View
                                    style={[
                                        styles.tooltip,
                                        {
                                            // Offset the popup slightly inwards using transforms based on its side
                                            transform: [
                                                {
                                                    translateX: isRightSide
                                                        ? anchorLeft !== undefined
                                                            ? -15
                                                            : 15
                                                        : anchorRight !== undefined
                                                        ? 15
                                                        : -15,
                                                },
                                                { translateY: isBottomSide ? -15 : 15 },
                                            ],
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.tooltipColor,
                                            { backgroundColor: data[selectedIndex].color },
                                        ]}
                                    />
                                    <Text style={styles.tooltipName}>
                                        {data[selectedIndex].label}
                                    </Text>
                                    <Text style={styles.tooltipPercentage}>
                                        {data[selectedIndex].percentage}%
                                    </Text>
                                </View>
                            </View>
                        );
                    })()}
            </View>
        </TouchableWithoutFeedback>
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
        fontSize: 14,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[600],
        textAlign: 'center',
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: typography.fontFamily.bold,
        color: colors.black,
        textAlign: 'center',
    },
    tooltipWrapper: {
        position: 'absolute',
        zIndex: 10,
    },
    tooltip: {
        backgroundColor: colors.white,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    tooltipColor: {
        width: 8,
        height: 4,
        borderRadius: 2,
        marginRight: 2,
    },
    tooltipName: {
        fontSize: 12,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[600],
        marginRight: 8,
        fontWeight: '400',
    },
    tooltipPercentage: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: typography.fontFamily.bold,
        color: colors.black,
    },
});

export default CostChart;
