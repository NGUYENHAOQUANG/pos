/**
 * @file TransferItemCard.tsx
 * @description CARD ITEM
 * @author NGUYENHAOQUANG
 * @created 2025-12-24
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography } from '@/styles';
import ArrowIcon from '@/assets/Icon/IconReport/Arrow.svg';

export interface TransferData {
    id: string;
    sourcePond: string;
    targetPond: string;
    transferDate: string;
    doc: number;
    amount: string;
    size: string;
    stockingDate: string;
    stockingAmount: string;
    expectedAmount: string;
}

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
                <Text style={styles.pondCode}>{item.sourcePond}</Text>
                <View style={styles.centerInfo}>
                    <Text style={styles.centerLineText}>Ngày sang: {item.transferDate}</Text>
                    <View style={styles.centerDivider}>
                        <ArrowIcon width={120} height={6} />
                    </View>
                    <Text style={styles.centerLineText}>Ngày nuôi (DOC): {item.doc}</Text>
                </View>
                <Text style={[styles.pondCode, styles.targetPondCode]}>{item.targetPond}</Text>
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
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.orange[600]}
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
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    targetPondCode: {
        textAlign: 'right',
    },
    centerInfo: {
        flex: 1,
        marginHorizontal: 12,
        alignItems: 'center',
    },
    centerLineText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.regular,
        fontWeight: typography.fontWeight.regular,
    },
    centerDivider: {
        marginVertical: 6,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 12,
        marginHorizontal: -16,
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
