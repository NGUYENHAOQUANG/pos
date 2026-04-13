import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';
import { formatPrice, getShrimpImage } from '@/features/menu/utils/shrimpPriceUtils';

interface AllShrimpListProps {
    shrimpPrices: ShrimpPrice[];
    theme: Colors;
}

const ShrimpListItem = React.memo(({ item, theme }: { item: ShrimpPrice; theme: Colors }) => {
    const getTrendColor = () => {
        if (item.trend === 'up') return theme.status.activeText;
        if (item.trend === 'down') return theme.status.warningText;
        return theme.textSecondary;
    };

    const getTrendIcon = () => {
        if (item.trend === 'up') return 'caret-up';
        if (item.trend === 'down') return 'caret-down';
        return 'remove';
    };

    const trendColor = getTrendColor();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.shrimpListItem, { backgroundColor: theme.background }]}
        >
            <Image
                source={item.image ? { uri: item.image } : getShrimpImage(item.name)}
                style={[styles.shrimpListImage, { backgroundColor: theme.backgroundTertiary }]}
                resizeMode="cover"
            />
            <View style={styles.shrimpListContent}>
                <Text style={[styles.shrimpListName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.shrimpListSize, { color: theme.textSecondary }]}>
                    Kích cỡ: {item.size} {item.unit}
                </Text>
                <View style={styles.shrimpListPriceRow}>
                    <Text style={[styles.shrimpListPrice, { color: theme.primary }]}>
                        {formatPrice(item.price)} đ
                    </Text>
                    <View
                        style={[
                            styles.shrimpListTrendBadge,
                            {
                                backgroundColor:
                                    item.trend === 'stable'
                                        ? theme.backgroundTertiary
                                        : item.trend === 'up'
                                        ? theme.status.activeBg
                                        : theme.status.warningBg,
                            },
                        ]}
                    >
                        <Ionicons name={getTrendIcon()} size={12} color={trendColor} />
                        <Text style={[styles.shrimpListTrendText, { color: trendColor }]}>
                            {item.trendValue || 'Ổn định'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

ShrimpListItem.displayName = 'ShrimpListItem';

export const AllShrimpList: React.FC<AllShrimpListProps> = ({ shrimpPrices, theme }) => {
    if (!shrimpPrices || shrimpPrices.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tất cả loại tôm</Text>
            </View>
            {shrimpPrices.map((item, index) => (
                <ShrimpListItem key={item.id || index.toString()} item={item} theme={theme} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    shrimpListItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    shrimpListImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    shrimpListContent: {
        flex: 1,
        marginLeft: spacing.sm + 4, // 12
    },
    shrimpListName: {
        fontSize: 15,
        fontWeight: '700',
    },
    shrimpListSize: {
        fontSize: 13,
        marginTop: spacing.xs,
    },
    shrimpListPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        justifyContent: 'space-between',
    },
    shrimpListPrice: {
        fontSize: 15,
        fontWeight: '800',
    },
    shrimpListTrendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
    },
    shrimpListTrendText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
});
