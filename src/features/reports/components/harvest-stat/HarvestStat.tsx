/**
 * @file HarvestStat.tsx
 * @description list item
 * @author NGUYENHAOQUANG
 * @created 2025-12-24
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { HarvestItemCard } from './HarvestItemCard';
import { mockData } from './MockData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const HarvestStat = () => {
    const [isSectionOpen, setIsSectionOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 3;

    const toggleSection = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSectionOpen(!isSectionOpen);
    };

    const toggleShowAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAll(!showAll);
    };

    const displayedData = showAll ? mockData : mockData.slice(0, INITIAL_SHOW_COUNT);

    return (
        <View style={styles.container}>
            <BasicDropDownButton
                label="THỐNG KÊ THU HOẠCH"
                style={styles.sectionHeader}
                onPress={toggleSection}
            />

            {isSectionOpen && (
                <View style={styles.listContainer}>
                    {displayedData.map(item => (
                        <HarvestItemCard key={item.id} item={item} />
                    ))}

                    {mockData.length > INITIAL_SHOW_COUNT && (
                        <TouchableOpacity
                            style={styles.seeAllButton}
                            onPress={toggleShowAll}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.seeAllText}>
                                {showAll ? 'Thu gọn' : 'Xem tất cả'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginBottom: 16,
    },
    sectionHeader: {
        backgroundColor: colors.white,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: colors.borderLight,
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    seeAllButton: {
        marginTop: 4,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: colors.white,
    },
    seeAllText: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '500',
    },
});
