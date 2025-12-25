/**
 * @file HarvestItemCard.tsx
 * @description Card item hiển thị thông tin thu hoạch chi tiết
 * @author NGUYENHAOQUANG
 * @created 2025-12-25
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

export interface HarvestData {
    id: string;
    harvestDate: string;
    cycleId: string;
    pondId: string;
    harvestType: string;
    output: string;
    size: number;
    price: string;
    revenue: string;
    cumulativeCost: string;
}

interface Props {
    item: HarvestData;
}

export const HarvestItemCard = ({ item }: Props) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const renderRow = (label: string, value: string | number) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.card}>
            {/* Title: Mã Ao - Mã Chu Kỳ */}
            <Text style={styles.cardTitle}>
                <Text style={styles.bold}>Ao: </Text>
                {item.pondId} -<Text style={styles.bold}> Chu kỳ: </Text>
                {item.cycleId}
            </Text>

            {/* Subtitle: Ngày thu - Loại thu hoạch */}
            <Text style={styles.cardSubtitle}>
                <Text style={styles.bold}>Ngày thu:</Text> {item.harvestDate} -
                <Text style={styles.bold}> Loại: </Text>
                {item.harvestType}
            </Text>

            <View style={styles.divider} />

            <View style={styles.content}>
                {/* Thông tin chính hiển thị ngay */}
                {renderRow('Sản lượng (kg)', item.output)}
                {renderRow('Cỡ tôm (con/kg)', item.size)}
                {renderRow('Doanh thu (VNĐ)', item.revenue)}

                {/* Thông tin chi tiết khi mở rộng */}
                {expanded && (
                    <View style={styles.expandedContent}>
                        {renderRow('Đơn giá (VNĐ/kg)', item.price)}
                        {renderRow('Chi phí lũy kế (VNĐ)', item.cumulativeCost)}
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
