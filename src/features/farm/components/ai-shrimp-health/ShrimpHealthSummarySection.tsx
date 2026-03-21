import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import {
    HealthCheckItem,
    HealthCheckResult,
} from '@/features/farm/services/shrimp-health-ai.service';

import InfoIcon from '@/assets/Icon/information-circle.svg';
import { Button } from '@/shared/components/buttons/Button';

interface Props {
    results: HealthCheckResult[];
    currentResult: HealthCheckResult | null;
    previousResult: HealthCheckResult | null;
    onShowDetailsPress: () => void;
    countTimes: number;
    showAddMore: boolean;
    onAddMore?: () => void;
}

export const ShrimpHealthSummarySection: React.FC<Props> = ({
    results,
    currentResult,
    previousResult: _previousResult,
    onShowDetailsPress,
    countTimes,
    showAddMore,
    onAddMore,
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
                    {countTimes > 1 ? (countTimes - 1).toString() : '-'}
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

            {countTimes > 0 && (
                <>
                    <View style={styles.infoBox}>
                        <InfoIcon width={20} height={20} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            Bạn có thể chụp thêm hình để kiểm tra thêm nếu cần.
                        </Text>
                    </View>

                    {showAddMore && (
                        <Button
                            title="Kiểm tra thêm"
                            onPress={onAddMore || (() => {})}
                            variant="outline"
                        />
                    )}
                </>
            )}
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
    infoBox: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderColor: colors.border,
        borderWidth: 1,
        overflow: 'hidden',
    },
    infoIcon: {
        marginRight: 8,
        flexShrink: 0,
        marginTop: 2,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        flex: 1,
    },
    addMoreText: {
        color: colors.textSecondary,
    },
});
