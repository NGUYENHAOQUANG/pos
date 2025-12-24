import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CollapseHead } from '@/features/farm/components/CollapseHead';
import CostChart from './CostChart';
import BottomCostChart from './BottomCostChart';

const CompilationCostChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <View style={styles.container}>
            <CollapseHead
                title="BIỂU ĐỒ CHI PHÍ"
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                style={styles.header}
                titleStyle={styles.headerTitle}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Stats Header */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Thức ăn</Text>
                            <Text style={styles.statValue}>38.91 tấn</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Chi phí</Text>
                            <Text style={styles.statValue}>2.24 tỉ</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>FCR</Text>
                            <Text style={styles.statValue}>1.37</Text>
                        </View>
                    </View>

                    {/* Chart */}
                    <View style={styles.chartContainer}>
                        <CostChart size={300} />
                    </View>

                    {/* Legend */}
                    <View style={styles.excludeContainer}>
                        <BottomCostChart />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginTop: 12,
    },
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textTransform: 'uppercase',
    },
    content: {
        backgroundColor: colors.white,
        paddingBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.black,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    excludeContainer: {
        paddingHorizontal: 8,
    },
});

export default CompilationCostChart;
