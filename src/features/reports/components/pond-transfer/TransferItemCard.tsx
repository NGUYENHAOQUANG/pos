/**
 * @file TransferItemCard.tsx
 * @description CARD ITEM
 * @author NGUYENHAOQUANG
 * @created 2025-12-24
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CaretDownIcon from '@/assets/Icon/IconReport/CaretDown.svg';
import { colors, typography } from '@/styles';
import ArrowIcon from '@/assets/Icon/IconReport/Arrow.svg';
import { TransferData } from '@/features/reports/types/stock-transfer-stats';

interface Props {
    item: TransferData;
}

export const TransferItemCard = ({ item }: Props) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const renderRow = (label: string, value: string, unit?: string) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.value}>{value}</Text>
                {unit ? <Text style={styles.valueUnit}>{unit}</Text> : null}
            </View>
        </View>
    );

    return (
        <View style={styles.card}>
            {/* Top summary row */}
            <View style={styles.topRow}>
                <Text style={styles.pondCode} numberOfLines={2}>
                    {item.sourcePond}
                </Text>
                <View style={styles.centerInfo}>
                    <Text style={styles.centerLineText} numberOfLines={1}>
                        Ngày sang: {item.transferDate}
                    </Text>
                    <View style={styles.centerDivider}>
                        <ArrowIcon width={'100%'} height={4} preserveAspectRatio="none" />
                    </View>
                    <Text style={styles.centerLineText} numberOfLines={1}>
                        Ngày nuôi (DOC): {item.doc}
                    </Text>
                </View>
                <Text style={[styles.pondCode, styles.targetPondCode]} numberOfLines={2}>
                    {item.targetPond}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Main content */}
            <View style={styles.content}>
                {renderRow('Lượng sang (con)', item.amount, 'con')}
                {renderRow('Cỡ tôm (con/kg)', item.size, 'con/kg')}

                {expanded && (
                    <View style={styles.expandedContent}>
                        {renderRow('Ngày thả', item.stockingDate)}
                        {renderRow('Lượng thả (Pls)', item.stockingAmount)}
                        {renderRow('Số tôm dự kiến (con)', item.expectedAmount)}
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn} activeOpacity={0.7}>
                <Text style={styles.expandText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                <CaretDownIcon
                    width={14}
                    height={14}
                    style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
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
        color: colors.text,
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
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
        textAlign: 'center',
    },

    centerDivider: {
        marginVertical: 6,
        alignSelf: 'stretch',
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 12,
        marginHorizontal: 2,
    },
    content: {
        gap: 6,
    },
    expandedContent: {
        gap: 6,
        marginTop: 2,
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
        color: colors.text,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
    },
    valueUnit: {
        fontSize: 12,
        color: colors.textSecondary,
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
        color: colors.orange[600],
        fontWeight: '500',
    },
});
