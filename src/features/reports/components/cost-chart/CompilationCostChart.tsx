import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { borderRadius, colors } from '@/styles';
import { typography } from '@/styles/typography';
import { BasicDropDownButton } from '../BasicDropDownButton';
import CostChart from './CostChart';
import { COST_DATA } from './costChartData';

import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import CostChartIcon from '@/assets/Icon/IconReport/CostChartIcon.svg';
import { PondIndexCard } from '../env-chart/PondIndexCard';
const CompilationCostChart = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isExpanded) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<CostChartIcon width={16} height={16} />}
                label="BIỂU ĐỒ CHI PHÍ"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.header}
            />

            {isExpanded && (
                <View style={[styles.content, isLoading ? styles.loadingContainer : undefined]}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            {/* Stats Header */}
                            <View style={styles.statsContainer}>
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{
                                        id: '1',
                                        name: 'Thức ăn',
                                        value: '38.91 tấn',
                                        color: '',
                                    }}
                                />
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{ id: '2', name: 'Chi phí', value: '2.24 tỉ', color: '' }}
                                />
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{ id: '3', name: 'FCR', value: '1.37', color: '' }}
                                />
                            </View>

                            {/* Chart */}
                            <View style={styles.chartContainer}>
                                <CostChart size={300} data={COST_DATA} totalDisplay="2.24 tỉ" />
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Legend */}
                            {/* <View style={styles.excludeContainer}>
                                <BottomCostChart data={COST_DATA} />
                            </View> */}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 8,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    excludeContainer: {
        paddingHorizontal: 8,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 8,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CompilationCostChart;
