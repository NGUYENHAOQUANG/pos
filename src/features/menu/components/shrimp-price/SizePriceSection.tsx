import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors } from '@/styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';
import { formatPrice } from '@/features/menu/utils/shrimpPriceUtils';

interface SizePriceSectionProps {
    activeSpecies: string;
    speciesList: ShrimpPrice[];
    activeSizeId: string | null;
    onSelectSize: (id: string) => void;
    theme: Colors;
}

/** Size-based price pills + cards section */
export const SizePriceSection: React.FC<SizePriceSectionProps> = ({
    activeSpecies,
    speciesList,
    activeSizeId,
    onSelectSize,
    theme,
}) => {
    return (
        <View
            style={[
                styles.sectionContainer,
                { backgroundColor: theme.background, borderColor: theme.defaultBorder },
            ]}
        >
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Giá theo size{' '}
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                        ({activeSpecies.toLowerCase()})
                    </Text>
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>Đơn vị: đ/kg</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sizeListWrapper}
            >
                {speciesList.map(item => {
                    const isActive = activeSizeId === item.id;
                    const getTrendColor = () => {
                        if (item.trend === 'up') return theme.green[600];
                        if (item.trend === 'down') return theme.red[500];
                        return theme.textSecondary;
                    };
                    const getTrendIcon = () => {
                        if (item.trend === 'up') return 'caret-up';
                        if (item.trend === 'down') return 'caret-down';
                        return 'remove';
                    };
                    const trendColor = getTrendColor();

                    return (
                        <View key={item.id} style={styles.sizeColumn}>
                            <TouchableOpacity
                                style={[
                                    styles.sizePill,
                                    {
                                        backgroundColor: isActive
                                            ? theme.primary
                                            : theme.backgroundTertiary,
                                    },
                                ]}
                                onPress={() => onSelectSize(item.id)}
                            >
                                <Text
                                    style={[
                                        styles.sizePillText,
                                        { color: isActive ? theme.white : theme.textSecondary },
                                    ]}
                                >
                                    {item.size} con/kg
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sizeCard,
                                    {
                                        backgroundColor: theme.background,
                                        borderColor: theme.defaultBorder,
                                    },
                                ]}
                                onPress={() => onSelectSize(item.id)}
                            >
                                <Text style={[styles.sizeCardPrice, { color: theme.text }]}>
                                    {formatPrice(item.price)}
                                </Text>
                                <View style={styles.sizeTrendRow}>
                                    <Ionicons name={getTrendIcon()} size={12} color={trendColor} />
                                    <Text style={[styles.sizeTrendText, { color: trendColor }]}>
                                        {item.trendValue || 'Ổn định'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontWeight: '700',
    },
    unitText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sizeListWrapper: {
        gap: 12,
        paddingBottom: 4,
    },
    sizeColumn: {
        width: 85,
        gap: 4,
        alignItems: 'center',
    },
    sizePill: {
        paddingVertical: 6,
        width: '100%',
        alignItems: 'center',
        borderRadius: 8,
    },
    sizePillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sizeCard: {
        width: '100%',
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
        alignItems: 'center',
        borderWidth: 1,
    },
    sizeCardPrice: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    sizeTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    sizeTrendText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
