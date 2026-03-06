import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing } from '@/styles';
import {
    HealthCheckItem,
    HealthCheckResult,
} from '@/features/farm/services/shrimp-health-ai.service';

interface Props {
    results: HealthCheckResult[];
    currentResult: HealthCheckResult | null;
    previousResult: HealthCheckResult | null;
    onShowDetailsPress: () => void;
}

export const ShrimpHealthSummarySection: React.FC<Props> = ({
    results,
    currentResult,
    previousResult,
    onShowDetailsPress,
}) => {
    return (
        <View style={styles.container}>
            {/* Total Count */}
            <View style={styles.row}>
                <Text style={styles.label}>Tổng số lượng tôm{'\n'}được kiểm tra - AI</Text>
                <Text style={styles.value}>
                    {currentResult ? currentResult.totalCount.toString() : '-'}
                </Text>
            </View>

            {/* Previous Count */}
            <View style={styles.row}>
                <Text style={styles.label}>Lần kiểm tra trước</Text>
                <Text style={styles.value}>
                    {previousResult ? previousResult.totalCount.toString() : '-'}
                </Text>
            </View>

            {/* Health Status */}
            <View style={styles.row}>
                <Text style={styles.label}>Tình trạng tôm - AI</Text>
                {(() => {
                    if (results.length === 0) {
                        return <Text style={styles.value}>-</Text>;
                    }

                    const allItems = results.reduce<HealthCheckItem[]>(
                        (acc, res) => acc.concat(res.items),
                        []
                    );

                    const firstSick = allItems.find(i => i.status !== 'HEALTHY');

                    if (firstSick) {
                        return (
                            <TouchableOpacity
                                style={[styles.statusPill, styles.statusPillSick]}
                                onPress={onShowDetailsPress}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[styles.statusText, styles.statusTextSick]}
                                    numberOfLines={1}
                                >
                                    Tôm {firstSick.index}: {firstSick.diagnosis}... Xem thêm
                                </Text>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            style={[styles.statusPill, styles.statusPillHealthy]}
                            onPress={onShowDetailsPress}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.statusText, styles.statusTextHealthy]}>
                                Khỏe mạnh
                            </Text>
                        </TouchableOpacity>
                    );
                })()}
            </View>

            {/* Infection Rate */}
            <View style={styles.row}>
                <Text style={styles.label}>Trung bình tỉ lệ nhiễm</Text>
                <Text style={styles.value}>
                    {(() => {
                        if (results.length === 0) return '-';

                        let totalSick = 0;
                        let totalChecked = 0;

                        results.forEach(res => {
                            totalChecked += res.totalCount;
                            totalSick += res.items.filter(i => i.status !== 'HEALTHY').length;
                        });

                        if (totalChecked === 0) return '0%';

                        const rate = (totalSick / totalChecked) * 100;
                        return `${parseFloat(rate.toFixed(2))}%`;
                    })()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
        paddingVertical: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 24,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginLeft: spacing.md,
    },
    statusPill: {
        borderRadius: 100,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderWidth: 1,
        marginLeft: spacing.md,
        maxWidth: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusPillHealthy: {
        backgroundColor: colors.green[50], // Tương tự background màu xanh nhạt
        borderColor: colors.green[200], // Viền màu xanh lá
    },
    statusTextHealthy: {
        color: colors.green[600],
    },
    statusPillSick: {
        backgroundColor: colors.red[50],
        borderColor: colors.red[200],
    },
    statusTextSick: {
        color: colors.red[600],
    },
});
