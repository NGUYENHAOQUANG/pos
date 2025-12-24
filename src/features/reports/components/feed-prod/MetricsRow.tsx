import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';

interface MetricsRowProps {
    production?: string;
    consumed?: string;
    fcr?: string;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
    production = '28.38 tấn',
    consumed = '39.91 tấn',
    fcr = '1.37',
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.metricsTopRow}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Sản lượng</Text>
                    <Text style={styles.metricValue}>{production}</Text>
                </View>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Đã ăn</Text>
                    <Text style={styles.metricValue}>{consumed}</Text>
                </View>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>FCR</Text>
                    <Text style={styles.metricValue}>{fcr}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 64,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
    },
    metricsTopRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 40,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.xs,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 28,
    },
});
