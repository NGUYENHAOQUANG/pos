/**
 * @file TransferItemCard.tsx
 * @description CARD ITEM
 * @author NGUYENHAOQUANG
 * @created 2025-12-24
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CaretDownIcon from '@/assets/Icon/IconReport/CaretDown.svg';
import { colors, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import ArrowIcon from '@/assets/Icon/IconReport/Arrow.svg';
import { TransferData } from '@/features/reports/types/stock-transfer-stats';

interface Props {
    item: TransferData;
}

export const TransferItemCard = ({ item }: Props) => {
    const theme = useAppTheme();
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const renderRow = (label: string, value: string, unit?: string) => (
        <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}:</Text>
            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
                {unit ? (
                    <Text style={[styles.valueUnit, { color: theme.textSecondary }]}>{unit}</Text>
                ) : null}
            </View>
        </View>
    );

    return (
        <View
            style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
            {/* Top summary row */}
            <View style={styles.topRow}>
                <Text style={[styles.pondCode, { color: theme.text }]} numberOfLines={2}>
                    {item.sourcePond}
                </Text>
                <View style={styles.centerInfo}>
                    <Text
                        style={[styles.centerLineText, { color: theme.textSecondary }]}
                        numberOfLines={1}
                    >
                        Ngày sang: {item.transferDate}
                    </Text>
                    <View style={styles.centerDivider}>
                        <ArrowIcon
                            width={'100%'}
                            height={4}
                            preserveAspectRatio="none"
                            color={theme.textSecondary}
                        />
                    </View>
                    <Text
                        style={[styles.centerLineText, { color: theme.textSecondary }]}
                        numberOfLines={1}
                    >
                        Ngày nuôi (DOC): {item.doc}
                    </Text>
                </View>
                <Text
                    style={[styles.pondCode, styles.targetPondCode, { color: theme.text }]}
                    numberOfLines={2}
                >
                    {item.targetPond}
                </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Main content */}
            <View style={styles.content}>
                {renderRow('Lượng sang (con)', item.amount, 'con')}
                {renderRow('Cỡ tôm (con/kg)', item.size, 'con/kg')}

                {expanded && (
                    <View style={styles.expandedContent}>
                        {renderRow('Ngày thả', item.stockingDate)}
                        {renderRow('Lượng thả (Pls)', item.stockingAmount, 'con')}
                        {renderRow('Số tôm dự kiến (con)', item.expectedAmount, 'con')}
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn} activeOpacity={0.7}>
                <Text
                    style={[
                        styles.expandText,
                        { color: theme.isDark ? '#fb923c' : colors.orange[600] },
                    ]}
                >
                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                </Text>
                <CaretDownIcon
                    width={14}
                    height={14}
                    color={theme.isDark ? '##FD6900' : colors.orange[600]}
                    style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        borderWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    pondCode: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    targetPondCode: {
        textAlign: 'right',
    },

    centerInfo: {
        flex: 2,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    centerLineText: {
        fontSize: 14,
        fontWeight: typography.fontWeight.regular,
        textAlign: 'center',
    },

    centerDivider: {
        marginVertical: 6,
        alignSelf: 'stretch',
    },
    divider: {
        height: 1,
        marginBottom: 12,
        marginHorizontal: 2,
    },
    content: {
        gap: 6,
    },
    expandedContent: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
    },
    valueUnit: {
        fontSize: 12,
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 4,
    },
    expandText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
