import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { formatNumber } from '@/features/farm/utils/numberUtils';

export interface InfoItem {
    label: string;
    value: string | number;
}

export interface ResultItem {
    label: string;
    value: string | number;
}

interface PondDataBoxProps {
    title: string;
    children?: ReactNode;
    infoItems?: InfoItem[];
    resultItems?: ResultItem[];
    disclaimerText?: string;
    containerStyle?: ViewStyle;
}

export const PondDataBox: React.FC<PondDataBoxProps> = ({
    title,
    children,
    infoItems,
    resultItems,
    disclaimerText = 'Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập',
    containerStyle,
}) => {
    const formatValue = (value: string | number): string => {
        if (typeof value === 'number') {
            return formatNumber(value);
        }
        return value || '-';
    };

    return (
        <SelectionInfoBox title={title} style={containerStyle}>
            {/* Info Section (Read-only) */}
            {infoItems && infoItems.length > 0 && (
                <View style={styles.infoSectionContainer}>
                    {infoItems.map((item, index) => (
                        <View key={index} style={styles.infoSection}>
                            <Text style={styles.infoLabel}>{item.label}:</Text>
                            <Text style={styles.infoValue}>{formatValue(item.value)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Children (Input fields, etc.) */}
            {children}

            {/* Result Section */}
            {resultItems && resultItems.length > 0 && (
                <View style={styles.resultSectionContainer}>
                    <View style={styles.resultBox}>
                        {resultItems.map((item, index) => (
                            <View key={index} style={styles.resultRow}>
                                <Text style={styles.resultLabel}>{item.label}</Text>
                                <Text
                                    style={styles.resultValue}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {formatValue(item.value)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* Disclaimer */}
                    {disclaimerText && <Text style={styles.disclaimer}>{disclaimerText}</Text>}
                </View>
            )}
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    infoSectionContainer: {
        gap: spacing.xs,
    },
    infoSection: {
        flexDirection: 'row',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 22,
        color: colors.text,
        marginRight: spacing.xs,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 22,
        color: colors.text,
        flex: 1,
    },
    resultSectionContainer: {
        gap: spacing.xs,
    },
    resultBox: {
        backgroundColor: colors.neutral,
        borderRadius: borderRadius.md,
        padding: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        flexShrink: 0,
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 22,
        textAlign: 'right',
        flexShrink: 1,
        minWidth: 60,
    },
    disclaimer: {
        fontSize: 13,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0,
        color: colors.textMuted,
    },
});
