import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors } from '@/styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';
import {
    formatPrice,
    getShrimpImage,
    generateHistoricalData,
} from '@/features/menu/utils/shrimpPriceUtils';
import { MiniSparkline } from '@/features/menu/components/shrimp-price/MiniSparkline';

const { width } = Dimensions.get('window');

interface SpeciesCardListProps {
    speciesNames: string[];
    groupedShrimps: Record<string, ShrimpPrice[]>;
    activeSpecies: string;
    onSelectSpecies: (species: string) => void;
    theme: Colors;
}

interface SpeciesCardProps {
    species: string;
    firstItem: ShrimpPrice;
    isSelected: boolean;
    onSelectSpecies: (species: string) => void;
    theme: Colors;
}

const SpeciesCard: React.FC<SpeciesCardProps> = ({
    species,
    firstItem,
    isSelected,
    onSelectSpecies,
    theme,
}) => {
    const summaryData = React.useMemo(
        () => generateHistoricalData(firstItem.price),
        [firstItem.price]
    );
    const getTrendColor = () => {
        if (firstItem.trend === 'up') return theme.green[600];
        if (firstItem.trend === 'down') return theme.red[600];
        return theme.textSecondary;
    };

    const getTrendIcon = () => {
        if (firstItem.trend === 'up') return 'chevron-up';
        if (firstItem.trend === 'down') return 'chevron-down';
        return 'remove';
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onSelectSpecies(species)}
            style={[
                styles.speciesCardContainer,
                { backgroundColor: theme.background, borderColor: theme.defaultBorder },
                isSelected && styles.speciesCardSelected,
            ]}
        >
            {/* Image Overlay */}
            <View style={styles.speciesImageOverlay}>
                <Image
                    source={getShrimpImage(species)}
                    style={styles.speciesImage}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.speciesCardContent}>
                <Text style={[styles.speciesTitle, { color: theme.text }]}>{species}</Text>
                <View style={styles.speciesPriceBlock}>
                    <Text style={[styles.speciesPrice, { color: theme.primary }]}>
                        {formatPrice(firstItem.price)}{' '}
                        <Text style={[styles.speciesUnit, { color: theme.textSecondary }]}>
                            {firstItem.unit}
                        </Text>
                    </Text>
                    <View style={styles.speciesTrendRow}>
                        <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
                        <Text style={[styles.speciesTrendText, { color: getTrendColor() }]}>
                            {firstItem.trendValue || 'Ổn định'}
                        </Text>
                    </View>
                </View>

                <View style={styles.speciesChartWrapper}>
                    <MiniSparkline data={summaryData} theme={theme} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const SpeciesCardList: React.FC<SpeciesCardListProps> = ({
    speciesNames,
    groupedShrimps,
    activeSpecies,
    onSelectSpecies,
    theme,
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speciesListWrapper}
        >
            {speciesNames.map(species => {
                const firstItem = groupedShrimps[species][0];
                if (!firstItem) return null;
                const isSelected = activeSpecies === species;

                return (
                    <SpeciesCard
                        key={species}
                        species={species}
                        firstItem={firstItem}
                        isSelected={isSelected}
                        onSelectSpecies={onSelectSpecies}
                        theme={theme}
                    />
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    speciesListWrapper: {
        paddingHorizontal: 16,
        paddingTop: 3,
        paddingBottom: 16,
        gap: 16,
    },
    speciesCardContainer: {
        width: width * 0.46,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    speciesCardSelected: {
        transform: [{ scale: 1.02 }],
    },
    speciesImageOverlay: {
        position: 'absolute',
        top: -5,
        right: -10,
        opacity: 1,
    },
    speciesImage: {
        width: 120,
        height: 90,
    },
    speciesCardContent: {
        flex: 1,
        padding: 16,
    },
    speciesTitle: {
        fontSize: 14,
        fontWeight: '700',
        width: '80%',
    },
    speciesPriceBlock: {
        marginTop: 24,
    },
    speciesPrice: {
        fontSize: 22,
        fontWeight: '800',
    },
    speciesUnit: {
        fontSize: 12,
        fontWeight: '700',
    },
    speciesTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    speciesTrendText: {
        fontSize: 12,
        fontWeight: '700',
    },
    speciesChartWrapper: {
        position: 'absolute',
        bottom: -5,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});
