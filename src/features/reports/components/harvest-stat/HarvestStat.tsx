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
import chartStyles from '@/features/reports/styles/chart.styles';
import HarvestStatIcon from '@/assets/Icon/IconReport/HarvestStatIcon.svg';
import { useHarvestStatsTable } from '@/features/reports/hooks/useHarvestStatsTable';

import { PondData } from '@/features/farm/types/pond.types';
import { CycleData } from '@/features/farm/types/cycle.types';

interface HarvestStatProps {
    zoneId: string;
    pondId?: string;
    cycleId?: string;
    ponds?: PondData[];
    cycles?: CycleData[];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const HarvestStat: React.FC<HarvestStatProps> = ({
    zoneId,
    pondId,
    cycleId,
    ponds,
    cycles,
}) => {
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 3;

    const { data: response, isLoading: queryLoading } = useHarvestStatsTable({
        ZoneId: zoneId,
        CycleId: cycleId,
        Id: pondId,
        PageNumber: 1,
        PageSize: 100, // Load enough for simple list
        enabled: isSectionOpen,
    });
    const isLoading = isSectionOpen && queryLoading;

    // Map API data to UI format
    const dataList = React.useMemo(() => {
        if (!response?.data?.items) return [];

        const getPondName = (code: string | null) => {
            if (!code) return 'N/A';
            const pond = ponds?.find(p => p.code === code || p.id === code);
            return pond?.name || code;
        };

        const getCycleName = (code: string | null) => {
            if (!code) return undefined;
            const cycle = cycles?.find(c => c.code === code || c.id === code);
            return cycle?.name;
        };

        return response.data.items.map(record => ({
            ...record,
            pondName: getPondName(record.pondCode),
            cycleName: getCycleName(record.cycleCode),
        }));
    }, [response, ponds, cycles]);

    const displayedData = showAll ? dataList : dataList.slice(0, INITIAL_SHOW_COUNT);

    const toggleSection = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSectionOpen(!isSectionOpen);
    };

    const toggleShowAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAll(!showAll);
    };

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
                                <HarvestItemCard key={item.recordId} item={item} />
                            ))}

                            {dataList.length > INITIAL_SHOW_COUNT && (
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
        gap: 12,
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
