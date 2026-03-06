import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';

interface HeadingEnvChartProps {
    selected?: string;
    onSelect?: (item: string) => void;
}

const ITEMS = ['pH', 'DO', 'Nhiệt độ', 'Độ kiềm', 'Độ trong', 'Độ mặn'];

export const HeadingEnvChart = ({
    selected: selectedProp,
    onSelect: onSelectProp,
}: HeadingEnvChartProps) => {
    const [localSelected, setLocalSelected] = useState(ITEMS[0]);

    const selected = selectedProp ?? localSelected;
    const onSelect = onSelectProp ?? setLocalSelected;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {ITEMS.map(item => {
                    const isSelected = item === selected;
                    return (
                        <TouchableOpacity
                            key={item}
                            style={styles.item}
                            onPress={() => onSelect(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.text, isSelected && styles.textSelected]}>
                                {item}
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
