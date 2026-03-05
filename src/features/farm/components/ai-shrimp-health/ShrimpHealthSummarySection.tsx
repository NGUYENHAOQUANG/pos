import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius } from '@/styles';
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
        <>
            {/* Total Count */}
            <View>
                <View style={styles.labelWrapper}>
                    <View style={styles.requiredWrapper}>
                        <Text style={styles.required}>*</Text>
                    </View>
                    <Text style={styles.label}>Tổng số lượng tôm được kiểm tra - AI</Text>
                </View>
                <View style={styles.readOnlyInput}>
                    <Text style={[styles.readOnlyText, !currentResult && styles.placeholderText]}>
                        {currentResult
                            ? currentResult.totalCount.toString()
                            : 'Kết quả số lượng tôm từ AI'}
                    </Text>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                </View>
                <Text style={styles.helperText}>
                    Lần kiểm tra trước: {previousResult ? previousResult.totalCount : 0}
                </Text>
            </View>

            {/* Health Status */}
            <View>
                <View style={styles.labelWrapper}>
                    <View style={styles.requiredWrapper}>
                        <Text style={styles.required}>*</Text>
                    </View>
                    <Text style={styles.label}>Tình trạng tôm - AI</Text>
                </View>
                <TouchableOpacity
                    style={styles.readOnlyInput}
                    onPress={onShowDetailsPress}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[styles.readOnlyText, !currentResult && styles.placeholderText]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {(() => {
                            if (results.length === 0) return 'Kết quả tình trạng tôm từ AI';

                            const allItems = results.reduce<HealthCheckItem[]>(
                                (acc, res) => acc.concat(res.items),
                                []
                            );

                            const firstSick = allItems.find(i => i.status !== 'HEALTHY');
                            if (firstSick) {
                                return `Tôm ${firstSick.index}: ${firstSick.diagnosis}... Xem thêm`;
                            }

                            return 'Tôm khỏe mạnh';
                        })()}
                    </Text>
                    <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Infection Rate */}
            <View>
                <View style={styles.readOnlyInputGray}>
                    <Text style={styles.label}>Trung bình tỉ lệ nhiễm bệnh</Text>
                    <Text style={styles.summaryValue}>
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
                <Text style={styles.disclaimer}>
                    Kết quả được hệ thống tính tự động từ đầu ra của AI
                </Text>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 24,
    },
    requiredWrapper: {
        width: 7,
        marginRight: 4,
    },
    required: {
        color: colors.error,
    },
    readOnlyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        height: 44,
        backgroundColor: colors.white,
    },
    readOnlyInputGray: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        height: 44,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    readOnlyText: {
        fontSize: 14,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    summaryValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    disclaimer: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
});
