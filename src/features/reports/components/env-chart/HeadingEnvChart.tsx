import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { useAppTheme } from '@/styles/themeContext';

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
    const theme = useAppTheme();
    const displayItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
    const [localSelected, setLocalSelected] = useState(displayItems[0]?.key || '');

    const selected = selectedProp ?? localSelected;
    const onSelect = onSelectProp ?? setLocalSelected;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.background, borderBottomColor: theme.border },
            ]}
        >
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
                            <Text
                                style={[
                                    styles.text,
                                    { color: theme.textSecondary },
                                    isSelected && {
                                        color: theme.isDark ? colors.white : colors.black,
                                        fontWeight: '600',
                                    },
                                ]}
                            >
                                {item.label}
                            </Text>
                            {isSelected && (
                                <View
                                    style={[
                                        styles.indicator,
                                        {
                                            backgroundColor: theme.isDark
                                                ? colors.white
                                                : colors.black,
                                        },
                                    ]}
                                />
                            )}
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

        borderBottomWidth: 1,
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
        lineHeight: 22,
    },
    textSelected: {
        fontWeight: '600',
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});
