import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { G, Path } from 'react-native-svg';
import * as shape from 'd3-shape';
import { useAppTheme } from '@/styles/themeContext';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CostItem } from './costChartData';

// Truncate to N decimal places without rounding
const truncateToDecimals = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
};

const formatCompactCurrency = (value: number): string => {
    if (value === 0) return '0 đ';
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (absValue >= 1e9) {
        const val = truncateToDecimals(absValue / 1e9, 2);
        return `${sign}${val.toLocaleString('vi-VN')} Tỉ`;
    }
    if (absValue >= 1e6) {
        const val = truncateToDecimals(absValue / 1e6, 2);
        return `${sign}${val.toLocaleString('vi-VN')} Tr`;
    }
    if (absValue >= 1e3) {
        const val = truncateToDecimals(absValue / 1e3, 2);
        return `${sign}${val.toLocaleString('vi-VN')} K`;
    }
    return `${sign}${truncateToDecimals(absValue, 2).toLocaleString('vi-VN')} đ`;
};

interface CostChartProps {
    size?: number; // Currently passed as 300
    data: CostItem[];
    totalDisplay?: string;
}

const CostChart = ({ size = 300, data, totalDisplay = '0' }: CostChartProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const theme = useAppTheme();

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
                                        stroke={theme.background}
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

                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                            Tổng chi phí
                        </Text>
                        <Text style={[styles.totalValue, { color: theme.text }]}>
                            {totalDisplay}
                        </Text>
                    </View>
                </View>

                {/* Tooltip */}
                {selectedIndex !== null &&
                    (() => {
                        const pos = getTooltipCenter(arcs[selectedIndex]);
                        const isBottomSide = pos.cy > 0;

                        const padding = 16;
                        const tooltipWidth = containerWidth * 0.55;
                        const tooltipHeight = 80;

                        // Center horizontally
                        const tooltipLeft = (containerWidth - tooltipWidth) / 2;

                        // Vertical: above slice if bottom half, below if top half, clamped
                        let tooltipTop: number;
                        if (isBottomSide) {
                            tooltipTop = pos.y - tooltipHeight - 10;
                        } else {
                            tooltipTop = pos.y + 10;
                        }
                        tooltipTop = Math.max(
                            padding,
                            Math.min(tooltipTop, svgHeight - tooltipHeight - padding)
                        );

                        return (
                            <View
                                style={[
                                    styles.tooltipWrapper,
                                    {
                                        left: tooltipLeft,
                                        top: tooltipTop,
                                        width: tooltipWidth,
                                    },
                                ]}
                                pointerEvents="none"
                            >
                                <View
                                    style={[
                                        styles.tooltip,
                                        {
                                            backgroundColor: theme.backgroundButton,
                                            borderColor: theme.border,
                                            borderWidth: 1,
                                        },
                                    ]}
                                >
                                    <View style={styles.tooltipTitleRow}>
                                        <View
                                            style={[
                                                styles.tooltipColorDot,
                                                { backgroundColor: data[selectedIndex].color },
                                            ]}
                                        />
                                        <Text
                                            style={[styles.tooltipTitle, { color: theme.text }]}
                                            numberOfLines={2}
                                        >
                                            {data[selectedIndex].label}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.tooltipDetail,
                                            { color: theme.textSecondary },
                                        ]}
                                    >
                                        Chi phí:{' '}
                                        <Text
                                            style={[
                                                styles.tooltipDetailBold,
                                                { color: theme.text },
                                            ]}
                                        >
                                            {formatCompactCurrency(data[selectedIndex].value)}
                                        </Text>
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tooltipDetail,
                                            { color: theme.textSecondary },
                                        ]}
                                    >
                                        Tỉ trọng:{' '}
                                        <Text
                                            style={[
                                                styles.tooltipDetailBold,
                                                { color: theme.text },
                                            ]}
                                        >
                                            {data[selectedIndex].percentage}%
                                        </Text>
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
        color: colors.black,
        textAlign: 'center',
    },
    tooltipWrapper: {
        position: 'absolute',
        zIndex: 10,
    },
    tooltip: {
        padding: 10,
        borderRadius: 8,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    tooltipTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    tooltipColorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    tooltipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
        flexShrink: 1,
    },
    tooltipDetail: {
        fontSize: 12,
        color: colors.gray[600],
        marginBottom: 2,
    },
    tooltipDetailBold: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.black,
    },
});

export default CostChart;
