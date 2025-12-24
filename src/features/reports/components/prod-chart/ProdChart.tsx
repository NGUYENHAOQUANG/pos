import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const chartHeight = 220;

const getStyles = width => {
    const barWidth = width > 400 ? 30 : 20;
    return StyleSheet.create({
        wrapper: {
            backgroundColor: colors.white,
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.md,
            backgroundColor: colors.white,
        },
        headerText: {
            fontSize: width > 360 ? 14 : 12,
            fontWeight: '600',
            color: colors.text,
        },
        content: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
            backgroundColor: colors.white,
        },
        tabContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginVertical: spacing.md,
            alignSelf: 'center',
        },
        tab: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
        },
        tabText: {
            fontSize: width > 360 ? 14 : 12,
            color: colors.textSecondary,
        },
        activeTabText: {
            color: colors.primary,
            fontWeight: '600',
        },
        chartHeader: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: spacing.md,
        },
        chartSummary: {
            alignItems: 'center',
        },
        summaryLabel: {
            fontSize: width > 360 ? 14 : 12,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
        },
        summaryValue: {
            fontSize: width > 360 ? 22 : 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        chartArea: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            height: chartHeight,
            paddingHorizontal: spacing.xs,
        },
        barGroup: {
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
        },
        barLabel: {
            marginTop: spacing.sm,
            fontSize: width > 360 ? 12 : 10,
            color: colors.textSecondary,
        },
        barValueText: {
            fontSize: width > 360 ? 10 : 8,
            color: colors.text,
            marginBottom: 4,
            fontWeight: '500',
        },
        legendContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: spacing.lg,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: spacing.sm,
            marginVertical: spacing.xs,
        },
        legendColor: {
            width: 12,
            height: 12,
            marginRight: spacing.sm,
            borderRadius: 2,
        },
        legendText: {
            fontSize: width > 360 ? 12 : 10,
            color: colors.textSecondary,
        },
        legendWrapper: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.sm,
        },
        legendRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        legendTitle: {
            fontSize: width > 360 ? 12 : 10,
            color: colors.textSecondary,
            width: width > 360 ? 50 : 40,
        },
        yAxisContainer: {
            height: chartHeight,
            justifyContent: 'space-between',
            paddingRight: spacing.sm,
            alignItems: 'flex-end',
        },
        yAxisLabel: {
            fontSize: width > 360 ? 12 : 10,
            color: colors.textSecondary,
        },
        gridContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: chartHeight,
            justifyContent: 'space-between',
        },
        gridLine: {
            borderTopWidth: 1,
            borderColor: colors.border,
        },
        bar: {
            height: (value, maxValue) => (value > 0 ? (value / maxValue) * chartHeight : 0),
            width: barWidth,
            backgroundColor: 'transparent',
            borderRadius: 4,
        },
    });
};

const Bar = ({ value, maxValue, color, barWidth, valueOnTop, chartHeight, styles }) => {
    const barHeight = value > 0 ? (value / maxValue) * chartHeight : 0;
    const showValue = valueOnTop && value > 0;
    return (
        <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
            {showValue && <Text style={styles.barValueText}>{`${value.toFixed(2)}T`}</Text>}
            <View
                style={{
                    height: barHeight,
                    width: barWidth,
                    backgroundColor: color,
                    borderRadius: 4,
                }}
            />
        </View>
    );
};

const YAxisLabels = ({ labels, styles }) => (
    <View style={styles.yAxisContainer}>
        {labels.map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>
                {label}
            </Text>
        ))}
    </View>
);

const GridLines = ({ numberOfLines, styles }) => (
    <View style={styles.gridContainer}>
        {[...Array(numberOfLines)].map((_, index) => (
            <View key={index} style={styles.gridLine} />
        ))}
    </View>
);

const KhuVucChart = ({ styles }) => {
    const yAxisLabels = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5', '0'];
    const maxValue = 4;
    const barWidth = styles.bar.width;

    const data = [
        { type: 'single', label: 'Pond B5N3', value: 3.02, category: 'conlai', age: '60-70' },
        { type: 'single', label: 'Pong B5N4', value: 3.73, category: 'conlai', age: '>80' },
        { type: 'single', label: 'Pond B5NN5', value: 1.46, category: 'dathu', age: '>80' },
        {
            type: 'group',
            label: 'Pond BB5N6',
            values: [
                { value: 1.03, category: 'dathu', age: '>80' },
                { value: 0.65, category: 'conlai', age: '>80' },
            ],
        },
    ];

    const getColor = (category, age) => {
        if (category === 'conlai') {
            if (age === '>80') return colors.blue[600];
            if (age === '70-80') return colors.blue[400];
            if (age === '60-70') return colors.blue[300];
            return colors.blue[50];
        } else {
            // dathu
            if (age === '>80') return colors.orange[500];
            return colors.orange[500];
        }
    };

    return (
        <View>
            <View style={styles.chartHeader}>
                <View style={styles.chartSummary}>
                    <Text style={styles.summaryLabel}>Còn lại</Text>
                    <Text style={styles.summaryValue}>23.93 tấn</Text>
                </View>
                <View style={styles.chartSummary}>
                    <Text style={styles.summaryLabel}>Đã thu</Text>
                    <Text style={styles.summaryValue}>4.86 tấn</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
                <YAxisLabels labels={yAxisLabels} styles={styles} />
                <View style={{ flex: 1 }}>
                    <GridLines numberOfLines={yAxisLabels.length} styles={styles} />
                    <View style={styles.chartArea}>
                        {data.map((item, index) => (
                            <View key={index} style={styles.barGroup}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    {item.type === 'single' ? (
                                        <Bar
                                            value={item.value}
                                            maxValue={maxValue}
                                            color={getColor(item.category, item.age)}
                                            valueOnTop
                                            chartHeight={chartHeight}
                                            barWidth={barWidth}
                                            styles={styles}
                                        />
                                    ) : (
                                        item.values.map((bar, i) => (
                                            <Bar
                                                key={i}
                                                value={bar.value}
                                                maxValue={maxValue}
                                                color={getColor(bar.category, bar.age)}
                                                valueOnTop
                                                chartHeight={chartHeight}
                                                barWidth={barWidth}
                                                styles={styles}
                                            />
                                        ))
                                    )}
                                </View>
                                <Text style={styles.barLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.legendWrapper}>
                <View style={styles.legendRow}>
                    <Text style={styles.legendTitle}>Còn lại:</Text>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.blue[600] }]} />
                        <Text style={styles.legendText}>{`> 80`}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.blue[400] }]} />
                        <Text style={styles.legendText}>70 - 80</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.blue[300] }]} />
                        <Text style={styles.legendText}>60 - 70</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.blue[50] }]} />
                        <Text style={styles.legendText}>{`< 40`}</Text>
                    </View>
                </View>
                <View style={styles.legendRow}>
                    <Text style={styles.legendTitle}>Đã thu:</Text>
                    <View style={styles.legendItem}>
                        <View
                            style={[styles.legendColor, { backgroundColor: colors.orange[500] }]}
                        />
                        <Text style={styles.legendText}>{`> 80`}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const NgayTuoiChart = ({ styles }) => {
    const yAxisLabels = ['20', '15', '10', '5', '0'];
    const maxValue = 20;
    const barWidth = styles.bar.width;
    const data = [
        { label: '50 - 55', hienTai: 1.46, ngayToi: 1.46 },
        { label: '70 - 75', hienTai: 17.17, ngayToi: 0 },
        { label: '75 - 80', hienTai: 6.75, ngayToi: 18.32 },
        { label: '80 - 85', hienTai: 0, ngayToi: 7.21 },
    ];

    return (
        <View>
            <View style={styles.chartHeader}>
                <View style={styles.chartSummary}>
                    <Text style={styles.summaryLabel}>Hiện tại</Text>
                    <Text style={styles.summaryValue}>25.39 tấn</Text>
                </View>
                <View style={styles.chartSummary}>
                    <Text style={styles.summaryLabel}>5 ngày tới</Text>
                    <Text style={styles.summaryValue}>26.99 tấn</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
                <YAxisLabels labels={yAxisLabels} styles={styles} />
                <View style={{ flex: 1 }}>
                    <GridLines numberOfLines={yAxisLabels.length} styles={styles} />
                    <View style={styles.chartArea}>
                        {data.map((item, index) => (
                            <View key={index} style={styles.barGroup}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Bar
                                        value={item.hienTai}
                                        maxValue={maxValue}
                                        color={colors.blue[700]}
                                        valueOnTop
                                        chartHeight={chartHeight}
                                        barWidth={barWidth}
                                        styles={styles}
                                    />
                                    <Bar
                                        value={item.ngayToi}
                                        maxValue={maxValue}
                                        color={colors.orange[100]}
                                        valueOnTop
                                        chartHeight={chartHeight}
                                        barWidth={barWidth}
                                        styles={styles}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.blue[700] }]} />
                    <Text style={styles.legendText}>Hiện tại</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.orange[100] }]} />
                    <Text style={styles.legendText}>5 ngày tới</Text>
                </View>
            </View>
        </View>
    );
};

export const ProdChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('Khu vực');
    const [styles, setStyles] = useState(getStyles(Dimensions.get('window').width));

    useEffect(() => {
        const handleDimChange = ({ window }) => {
            setStyles(getStyles(window.width));
        };
        const subscription = Dimensions.addEventListener('change', handleDimChange);
        return () => subscription.remove();
    }, []);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.8}>
                <Text style={styles.headerText}>BIỂU ĐỒ SẢN LƯỢNG</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text}
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            onPress={() => setActiveTab('Ngày tuổi')}
                            style={[styles.tab, activeTab === 'Ngày tuổi' && styles.activeTab]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'Ngày tuổi' && styles.activeTabText,
                                ]}
                            >
                                Ngày tuổi
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('Khu vực')}
                            style={[styles.tab, activeTab === 'Khu vực' && styles.activeTab]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'Khu vực' && styles.activeTabText,
                                ]}
                            >
                                Khu vực
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'Ngày tuổi' ? (
                        <NgayTuoiChart styles={styles} />
                    ) : (
                        <KhuVucChart styles={styles} />
                    )}
                </View>
            )}
        </View>
    );
};
