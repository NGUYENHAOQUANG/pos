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
import { HarvestItemCard, HarvestData } from './HarvestItemCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const HarvestStat = () => {
    const [isSectionOpen, setIsSectionOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 3;

    // Dữ liệu mẫu
    const mockData: HarvestData[] = [
        {
            id: '1',
            pond: 'A1N1',
            harvestDate: '10/01/2026',
            doc: 37,
            receivedAmount: '120.000',
            size: '45',
            receivedDate: '01/12/2025',
            harvestType: 'Thu hết',
            yield: '2.500',
            revenue: '300.000.000',
        },
        {
            id: '2',
            pond: 'A1N1',
            harvestDate: '05/01/2026',
            doc: 33,
            receivedAmount: '110.000',
            size: '50',
            receivedDate: '01/12/2025',
            harvestType: 'Tỉa thưa',
            yield: '1.200',
            revenue: '150.000.000',
        },
        {
            id: '3',
            pond: 'A1N1',
            harvestDate: '01/01/2026',
            doc: 31,
            receivedAmount: '100.000',
            size: '55',
            receivedDate: '01/12/2025',
            harvestType: 'Tỉa thưa',
            yield: '800',
            revenue: '95.000.000',
        },
        {
            id: '4',
            pond: 'A1N2',
            harvestDate: '30/12/2025',
            doc: 29,
            receivedAmount: '90.000',
            size: '60',
            receivedDate: '02/12/2025',
            harvestType: 'Tỉa thưa',
            yield: '600',
            revenue: '70.000.000',
        },
        {
            id: '5',
            pond: 'A1N2',
            harvestDate: '28/12/2025',
            doc: 27,
            receivedAmount: '85.000',
            size: '65',
            receivedDate: '02/12/2025',
            harvestType: 'Tỉa thưa',
            yield: '500',
            revenue: '55.000.000',
        },
    ];

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
