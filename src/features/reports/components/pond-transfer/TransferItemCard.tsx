/**
 * @file TransferItemCard.tsx
 * @description CARD ITEM
 * @author NGUYENHAOQUANG
 * @created 2025-12-24
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

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

    const renderRow = (label: string, value: string) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>
                <Text style={styles.bold}>Ao gốc: </Text>
                {item.sourcePond} -<Text style={styles.bold}> Ao sang: </Text>
                {item.targetPond}
            </Text>
            <Text style={styles.cardSubtitle}>
                <Text style={styles.bold}>Ngày sang:</Text> {item.transferDate} -
                <Text style={styles.bold}> Ngày nuôi (DOC): </Text>
                {item.doc}
            </Text>

            <View style={styles.divider} />

            <View style={styles.content}>
                {renderRow('Lượng sang (con)', item.amount)}
                {renderRow('Cỡ tôm (con/kg)', item.size)}

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
                    color={colors.primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTitle: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 4,
    },
    bold: {
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: 13,
        color: colors.text,
        marginBottom: 8,
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
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    value: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 4,
    },
    expandText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '500',
    },
});
