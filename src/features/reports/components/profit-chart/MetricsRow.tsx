import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing } from '@/styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MetricsRowProps {
    revenue?: string;
    estimatedRevenue?: string;
    totalCost?: string;
    estimatedProfit?: string;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
    revenue = '5.45 tỉ',
    estimatedRevenue = '5.45 tỉ',
    totalCost = '3.53 tỉ',
    estimatedProfit = '1.92 tỉ',
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.metricsTopRow}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel} numberOfLines={1}>
                        Doanh thu
                    </Text>
                    <Text style={styles.metricValue}>{revenue}</Text>
                </View>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel} numberOfLines={1}>
                        Tổng doanh thu ước tính
                    </Text>
                    <Text style={styles.metricValue}>{estimatedRevenue}</Text>
                </View>
            </View>
            <View style={styles.metricsBottomRow}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel} numberOfLines={1}>
                        Tổng chi phí
                    </Text>
                    <Text style={styles.metricValue}>{totalCost}</Text>
                </View>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel} numberOfLines={1}>
                        Tổng lợi nhuận ước tính
                    </Text>
                    <Text style={styles.metricValue}>{estimatedProfit}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
    },
    metricsTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    metricsBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    metricItem: {
        alignItems: 'center',
        width: (SCREEN_WIDTH - 32) / 2, // Screen width minus container padding, divided by 2
        paddingHorizontal: spacing.xs,
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 28,
    },
});
