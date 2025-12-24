/**
 * @file PondTransfer.tsx
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
import { TransferItemCard, TransferData } from './TransferItemCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PondTransfer = () => {
    const [isSectionOpen, setIsSectionOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const INITIAL_SHOW_COUNT = 3;

    // Dữ liệu mẫu
    const mockData: TransferData[] = [
        {
            id: '1',
            sourcePond: 'A1V1',
            targetPond: 'A1N2',
            transferDate: '18/12/2025',
            doc: 17,
            amount: '50.000',
            size: '200',
            stockingDate: '01/12/2025',
            stockingAmount: '400.000',
            expectedAmount: '380.000',
        },
        {
            id: '2',
            sourcePond: 'A1V1',
            targetPond: 'A1N3',
            transferDate: '18/12/2025',
            doc: 17,
            amount: '45.000',
            size: '150',
            stockingDate: '01/12/2025',
            stockingAmount: '350.000',
            expectedAmount: '330.000',
        },
        {
            id: '3',
            sourcePond: 'A1V2',
            targetPond: 'A1N3',
            transferDate: '16/12/2025',
            doc: 16,
            amount: '60.000',
            size: '180',
            stockingDate: '02/12/2025',
            stockingAmount: '420.000',
            expectedAmount: '400.000',
        },
        {
            id: '4',
            sourcePond: 'A1V2',
            targetPond: 'A1N4',
            transferDate: '15/12/2025',
            doc: 15,
            amount: '55.000',
            size: '190',
            stockingDate: '03/12/2025',
            stockingAmount: '380.000',
            expectedAmount: '360.000',
        },
        {
            id: '5',
            sourcePond: 'A1V3',
            targetPond: 'A1N5',
            transferDate: '14/12/2025',
            doc: 14,
            amount: '48.000',
            size: '210',
            stockingDate: '04/12/2025',
            stockingAmount: '300.000',
            expectedAmount: '280.000',
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
                label="THỐNG KÊ SANG AO"
                style={styles.sectionHeader}
                onPress={toggleSection}
            />

            {isSectionOpen && (
                <View style={styles.listContainer}>
                    {displayedData.map(item => (
                        <TransferItemCard key={item.id} item={item} />
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
