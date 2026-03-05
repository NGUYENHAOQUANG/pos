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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { HarvestItemCard } from './HarvestItemCard';
import { harvestData } from './harvesStatData';
import chartStyles from '@/features/reports/styles/chart.styles';
import HarvestStatIcon from '@/assets/Icon/IconReport/HarvestStatIcon.svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const HarvestStat = () => {
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isSectionOpen) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isSectionOpen]);
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

    const displayedData = showAll ? harvestData : harvestData.slice(0, INITIAL_SHOW_COUNT);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<HarvestStatIcon width={16} height={16} />}
                label="THỐNG KÊ THU HOẠCH"
                style={styles.sectionHeader}
                onPress={toggleSection}
                isExpanded={isSectionOpen}
            />

            {isSectionOpen && (
                <View
                    style={[styles.listContainer, isLoading ? styles.loadingContainer : undefined]}
                >
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            {displayedData.map(item => (
                                <HarvestItemCard key={item.id} item={item} />
                            ))}

                            {harvestData.length > INITIAL_SHOW_COUNT && (
                                <TouchableOpacity
                                    style={styles.seeAllButton}
                                    onPress={toggleShowAll}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.seeAllText}>
                                        {showAll ? 'Thu gọn' : 'Xem tất cả'}
                                    </Text>
                                    {!showAll && (
                                        <Ionicons
                                            name="arrow-forward"
                                            size={16}
                                            color={colors.textSecondary}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    listContainer: {
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seeAllButton: {
        marginTop: 8,
        alignSelf: 'stretch',
        height: 40,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 10,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
