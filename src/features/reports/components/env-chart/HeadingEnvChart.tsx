import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';

interface HeadingItem {
    key: string;
    label: string;
}

interface HeadingEnvChartProps {
    /** Custom items from API metrics. Falls back to default if not provided. */
    items?: HeadingItem[];
    selected?: string;
    onSelect?: (item: string) => void;
}

const DEFAULT_ITEMS: HeadingItem[] = [
    { key: 'pH', label: 'pH' },
    { key: 'DO', label: 'DO' },
    { key: 'Nhiệt độ', label: 'Nhiệt độ' },
    { key: 'Độ kiềm', label: 'Độ kiềm' },
    { key: 'Độ trong', label: 'Độ trong' },
    { key: 'Độ mặn', label: 'Độ mặn' },
];

export const HeadingEnvChart = ({
    items,
    selected: selectedProp,
    onSelect: onSelectProp,
}: HeadingEnvChartProps) => {
    const displayItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
    const [localSelected, setLocalSelected] = useState(displayItems[0]?.key || '');

    const selected = selectedProp ?? localSelected;
    const onSelect = onSelectProp ?? setLocalSelected;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {displayItems.map(item => {
                    const isSelected = item.key === selected;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.item}
                            onPress={() => onSelect(item.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.text, isSelected && styles.textSelected]}>
                                {item.label}
                            </Text>
                            {isSelected && <View style={styles.indicator} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 46,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    scrollContent: {
        height: '100%',
        alignItems: 'center',
    },
    item: {
        marginRight: 24,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray[600],
        lineHeight: 22,
    },
    textSelected: {
        color: colors.text,
        fontWeight: '600',
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: colors.text,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});
