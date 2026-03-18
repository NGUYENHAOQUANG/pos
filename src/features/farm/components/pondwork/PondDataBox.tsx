import React, { ReactNode, useState } from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Dimensions, Modal } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { DetailRow } from '@/features/material/components/DetailRow';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { abbreviateNumber } from '@/shared/utils/formatters';
import EyeIcon from '@/assets/Icon/Eye.svg';

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
const SCREEN_WIDTH = Dimensions.get('window').width;

const ResultValue: React.FC<{
    value: string | number;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ value, isOpen, onToggle }) => {
    // Check if value is a number that can be abbreviated
    const numValue =
        typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
    const isNumeric = !isNaN(numValue) && String(value) !== '-';

    if (isNumeric) {
        const { abbreviated, full, detail, isAbbreviated } = abbreviateNumber(numValue);

        if (isAbbreviated) {
            return (
                <View style={styles.tooltipWrapper}>
                    <Pressable style={styles.abbreviatedRow} onPress={onToggle}>
                        <Text style={styles.resultValue} numberOfLines={1}>
                            {abbreviated}
                        </Text>
                        <EyeIcon width={16} height={16} />
                    </Pressable>
                    {isOpen && (
                        <View style={styles.tooltipContainer}>
                            <View style={styles.tooltipArrow} />
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipText}>{full}</Text>
                                <Text style={styles.tooltipDetailText}>{detail}</Text>
                            </View>
                        </View>
                    )}
                </View>
            );
        }
    }

    // Default: no abbreviation, no tooltip
    const displayValue = typeof value === 'number' ? formatNumber(value) : value || '-';
    return (
        <Text style={styles.resultValue} numberOfLines={1} adjustsFontSizeToFit>
            {displayValue}
        </Text>
    );
};

export const PondDataBox: React.FC<PondDataBoxProps> = ({
    title,
    children,
    infoItems,
    resultItems,
    disclaimerText = 'Kết quả được hệ thống tính tự động từ các số liệu bạn đã nhập',
    containerStyle,
}) => {
    // Only one tooltip open at a time
    const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

    const formatValue = (value: string | number): string => {
        if (typeof value === 'number') {
            return formatNumber(value);
        }
        return value || '-';
    };

    return (
        <>
            {/* Transparent overlay to dismiss tooltip on tap outside */}
            <Modal
                visible={activeTooltipIndex !== null}
                transparent
                animationType="none"
                onRequestClose={() => setActiveTooltipIndex(null)}
            >
                <Pressable
                    style={styles.dismissOverlay}
                    onPress={() => setActiveTooltipIndex(null)}
                />
            </Modal>
            <SelectionInfoBox title={title} style={containerStyle}>
                {/* Info Section (Read-only) */}
                {infoItems && infoItems.length > 0 && (
                    <View style={styles.infoSectionContainer}>
                        {infoItems.map((item, index) => (
                            <DetailRow
                                key={index}
                                label={item.label}
                                value={formatValue(item.value)}
                            />
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
                                    <ResultValue
                                        value={item.value}
                                        isOpen={activeTooltipIndex === index}
                                        onToggle={() =>
                                            setActiveTooltipIndex(
                                                activeTooltipIndex === index ? null : index
                                            )
                                        }
                                    />
                                </View>
                            ))}
                        </View>
                        {/* Disclaimer */}
                        {disclaimerText && <Text style={styles.disclaimer}>{disclaimerText}</Text>}
                    </View>
                )}
            </SelectionInfoBox>
        </>
    );
};

const styles = StyleSheet.create({
    infoSectionContainer: {
        gap: spacing.xs,
    },
    resultSectionContainer: {
        gap: spacing.xs,
        overflow: 'visible',
    },
    resultBox: {
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        overflow: 'visible',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'visible',
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textTertiary,
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
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0,
        color: colors.textMuted,
    },
    tooltipContent: {
        backgroundColor: colors.black,
        borderRadius: borderRadius.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignSelf: 'flex-end',
    },
    tooltipText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    tooltipDetailText: {
        color: colors.gray[400],
        fontSize: 13,
        fontWeight: '400',
        marginTop: 2,
    },
    resultValueTappable: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
        color: colors.primary,
    },
    abbreviatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tooltipWrapper: {
        position: 'relative',
        alignItems: 'flex-end',
    },
    tooltipContainer: {
        position: 'absolute',
        top: '100%',
        right: -8,
        marginTop: 4,
        zIndex: 999,
        width: SCREEN_WIDTH - 64,
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.black,
        alignSelf: 'flex-end',
        marginRight: 12,
    },
    dismissOverlay: {
        flex: 1,
    },
});
