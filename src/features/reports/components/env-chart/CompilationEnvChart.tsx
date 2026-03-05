import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '@/styles';

import { BasicDropDownButton } from '../BasicDropDownButton';
import { HeadingEnvChart } from './HeadingEnvChart';
import { PondIndex } from './PondIndex';
import EnvChar from './EnvChar';
import { BottomEnvChart } from './BottomEnvChart';

import { ENV_DATA, EnvLog, POND_COLORS } from './envChartData';
import { Loading } from '@/shared/components/ui/Loading';
import Peformance from '@/assets/Icon/IconReport/Peformance.svg';
import chartStyles from '@/features/reports/styles/chart.styles';

// Metric Map (duplicated from EnvChar for independence, or could be shared)
const METRIC_MAP: Record<string, { key: keyof EnvLog; label: string; unit: string }> = {
    pH: { key: 'pH', label: 'pH', unit: '' },
    DO: { key: 'do', label: 'DO', unit: 'mg/L' },
    'Nhiệt độ': { key: 'temp', label: 'Nhiệt độ', unit: '°C' },
    'Độ kiềm': { key: 'alk', label: 'Độ kiềm', unit: 'mg/L' },
    'Độ trong': { key: 'clear', label: 'Độ trong', unit: 'cm' },
    'Độ mặn': { key: 'salt', label: 'Độ mặn', unit: 'ppt' },
};

const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

const CompilationEnvChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedTab, setSelectedTab] = useState('pH');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        // Mock loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Calculate latest data for PondIndex
    const pondData = React.useMemo(() => {
        const metricInfo = METRIC_MAP[selectedTab] || METRIC_MAP['pH'];
        const metricKey = metricInfo.key;

        // Get unique ponds from colors or data
        const pondIds = Object.keys(POND_COLORS);

        return pondIds.map(pondId => {
            const pondLogs = ENV_DATA.filter(d => d.pond === pondId);
            // Sort by date descending to get latest
            pondLogs.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

            const latest = pondLogs[0];
            const value = latest ? latest[metricKey] : '--';
            const unit = value !== '--' && metricInfo.unit ? ` ${metricInfo.unit}` : '';

            return {
                id: pondId,
                name: pondId,
                value: `${value}${unit}`,
                color: POND_COLORS[pondId],
            };
        });
    }, [selectedTab]);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<Peformance width={18} height={18} />}
                label="BIỂU ĐỒ THÔNG SỐ MÔI TRƯỜNG"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.header}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={{ height: 300 }}>
                            <Loading />
                        </View>
                    ) : (
                        <>
                            <HeadingEnvChart selected={selectedTab} onSelect={setSelectedTab} />

                            <PondIndex data={pondData} />

                            <View style={styles.chartContainer}>
                                <EnvChar selected={selectedTab} />
                            </View>

                            <View style={styles.divider} />

                            <BottomEnvChart />
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

export default CompilationEnvChart;

const styles = StyleSheet.create({
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textTransform: 'uppercase',
    },
    content: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    chartContainer: {
        marginVertical: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 8,
    },
});
