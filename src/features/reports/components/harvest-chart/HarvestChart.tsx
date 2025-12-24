import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, layout, shadows, typography } from '@/styles';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
const harvestData = [
    { id: '1', value: 1460, label: 'N05', displayValue: '1,460' },
    { id: '2', value: 1340, label: 'N07', displayValue: '1,340' },
    { id: '3', value: 1030, label: 'N06', displayValue: '1,030' },
    { id: '4', value: 1030, label: 'N02', displayValue: '1,030' },
];

const MAX_VALUE = 1600;
const CHART_CONTENT_HEIGHT = 394;
const BAR_MAX_HEIGHT = 340.61;

export const HarvestChart: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getBarHeight = (value: number) => {
        return (value / MAX_VALUE) * BAR_MAX_HEIGHT;
    };

    return (
        <View style={styles.card}>
            {/* Header-Section */}
            <BasicDropDownButton
                label={<Text style={styles.headerTitle}>BIỂU ĐỒ THU HOẠCH</Text>}
                onPress={() => setIsCollapsed(!isCollapsed)}
                style={styles.headerButton}
            />

            {!isCollapsed && (
                <View style={styles.body}>
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryLabel}>Sản lượng đã thu hoạch</Text>
                        <Text style={styles.summaryValue}>4.86 tấn</Text>
                    </View>

                    <View style={styles.chartAreaWrapper}>
                        <View style={styles.yAxisLabels}>
                            {[1600, 1200, 800, 400, 0].map(val => (
                                <View key={val} style={styles.yLabelWrapper}>
                                    <Text style={styles.yLabelText}>{val.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Chart-Section */}
                        <View style={styles.chartContent}>
                            <View style={styles.gridContainer} pointerEvents="none">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <View
                                        key={i}
                                        style={[styles.gridLine, { top: i * (BAR_MAX_HEIGHT / 4) }]}
                                    />
                                ))}
                            </View>
                            <View style={styles.barsWrapper}>
                                {harvestData.map(item => (
                                    <View key={item.id} style={styles.barColumn}>
                                        <Text style={styles.topValueText}>{item.displayValue}</Text>
                                        <View
                                            style={[
                                                styles.bar,
                                                { height: getBarHeight(item.value) },
                                            ]}
                                        />
                                        <Text style={styles.bottomLabelText}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        width: '100%',
        alignSelf: 'center',
        marginVertical: spacing.sm,
        shadow: shadows.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: layout.rowBetween.justifyContent,
        alignItems: layout.centered.alignItems,
        minHeight: 54,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    body: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    summaryContainer: {
        alignItems: 'center',
        minHeight: 70,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        width: '100%',
    },
    summaryLabel: {
        fontSize: 10,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    summaryValue: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    chartAreaWrapper: {
        flexDirection: 'row',
        height: CHART_CONTENT_HEIGHT,
    },
    yAxisLabels: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        height: BAR_MAX_HEIGHT + 14,
        marginTop: 13,
        paddingBottom: 3,
    },
    yLabelText: {
        fontSize: typography.fontSize.xs,
        color: colors.text,
        textAlign: 'right',
        width: 35,
    },
    yLabelWrapper: {
        height: 14,
        justifyContent: 'center',
    },
    chartContent: {
        flex: 1,
        height: CHART_CONTENT_HEIGHT,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        marginTop: 20,
        height: BAR_MAX_HEIGHT,
        justifyContent: layout.justify.between,
    },
    gridLine: {
        height: 0.75,
        backgroundColor: colors.defaultBorder,
    },
    barsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: BAR_MAX_HEIGHT + 31,
        paddingBottom: 7,
    },
    barColumn: {
        alignItems: 'center',
    },
    bar: {
        width: 20.48,
        backgroundColor: colors.orange[700],
    },
    topValueText: {
        fontSize: typography.fontSize.xs,
        marginBottom: spacing.xs,
        fontWeight: typography.fontWeight.regular,
    },
    bottomLabelText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        marginTop: spacing.sm,
        position: 'absolute',
        bottom: -25,
    },
    headerButton: {
        // Ghi đè style của BasicDropDownButton
        height: 54,
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        borderRadius: 0,
    },
});
