import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeedingChart from '../../components/Chart/FeedingChart';
import FilterDate from '../../components/schedule/FilterDate';
import { spacing } from '@/styles';
import { SENSOR_STATISTICS } from '@/features/control/data/devicesData';

interface SensorStatisticsScreenProps {
    pondId: string;
}

function SensorStatisticsScreen({ pondId }: SensorStatisticsScreenProps) {
    // Filter for filtered pondId
    const chartData = SENSOR_STATISTICS.filter(d => d.pondId === pondId);

    return (
        <View style={styles.container}>
            <View style={styles.filterWrapper}>
                <FilterDate />
            </View>
            <FeedingChart data={chartData} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterWrapper: {
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
});

export default SensorStatisticsScreen;
