import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { CollapseHead } from '@/features/farm/components/CollapseHead';
import { HeadingEnvChart } from './HeadingEnvChart';
import { PondIndex } from './PondIndex';
import EnvChar from './EnvChar';
import { BottomEnvChart } from './BottomEnvChart';

import { Loading } from '@/shared/components/ui/Loading';

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

    return (
        <View style={styles.container}>
            <CollapseHead
                title="BIỂU ĐỒ THÔNG SỐ MÔI TRƯỜNG"
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                style={styles.header}
                titleStyle={styles.headerTitle}
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

                            <PondIndex />

                            <View style={styles.chartContainer}>
                                <EnvChar />
                            </View>

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
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textTransform: 'uppercase',
    },
    content: {
        backgroundColor: colors.white,
    },
    chartContainer: {
        marginVertical: 16,
    },
});
