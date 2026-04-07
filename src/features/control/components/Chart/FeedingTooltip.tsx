import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Polygon } from 'react-native-svg';
import { useAppTheme } from '@/styles/themeContext';

interface FeedingTooltipProps {
    x: number;
    y: number;
    time: string;
    weight: number;
    visible: boolean;
}

export const FeedingTooltip = ({ x, y, time, weight, visible }: FeedingTooltipProps) => {
    const theme = useAppTheme();

    if (!visible) return null;

    const tooltipWidth = 120;
    const tooltipHeight = 55;
    const arrowHeight = 8;
    const arrowWidth = 12;

    const leftPos = x - tooltipWidth / 2;
    const topPos = y - tooltipHeight - arrowHeight - 5;

    return (
        <View style={[styles.container, { left: leftPos, top: topPos }]}>
            <View
                style={[
                    styles.box,
                    {
                        width: tooltipWidth,
                        height: tooltipHeight,
                        backgroundColor: theme.gray[900],
                    },
                ]}
            >
                <Text style={[styles.timeText, { color: theme.gray[400] }]}>{time}</Text>
                <Text style={styles.valueText}>Loadcell: {weight} kg</Text>
            </View>

            <View style={styles.arrowContainer}>
                <Svg width={arrowWidth} height={arrowHeight}>
                    <Polygon
                        points={`0,0 ${arrowWidth},0 ${arrowWidth / 2},${arrowHeight}`}
                        fill={theme.gray[900]}
                    />
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
        borderRadius: 8,
        padding: 8,
        justifyContent: 'center',
    },
    arrowContainer: {
        marginTop: -1,
    },
    timeText: {
        fontSize: 12,
        marginBottom: 2,
    },
    valueText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },
});
