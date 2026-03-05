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
import { Loading } from '@/shared/components/ui/Loading';
import { TransferItemCard } from './TransferItemCard';
import { pondTransferData } from './pondTransferData';
import chartStyles from '@/features/reports/styles/chart.styles';
import PondTransferIcon from '@/assets/Icon/IconReport/PondTransferIcon.svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PondTransfer = () => {
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

    const displayedData = showAll
        ? pondTransferData
        : pondTransferData.slice(0, INITIAL_SHOW_COUNT);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<PondTransferIcon width={16} height={16} />}
                label="THỐNG KÊ SANG AO"
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
                                <TransferItemCard key={item.id} item={item} />
                            ))}

                            {pondTransferData.length > INITIAL_SHOW_COUNT && (
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
        gap: 12,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
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
