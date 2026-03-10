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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { TransferItemCard } from './TransferItemCard';
import { useStockTransferStats } from '@/features/reports/hooks/useStockTransferStats';
import { formatDate } from '@/shared/utils/formatters';
import chartStyles from '@/features/reports/styles/chart.styles';
import PondTransferIcon from '@/assets/Icon/IconReport/PondTransferIcon.svg';
import { PondData } from '@/features/farm/types/pond.types';

interface PondTransferProps {
    zoneId: string;
    pondId?: string;
    cycleId?: string;
    ponds?: PondData[];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PondTransfer: React.FC<PondTransferProps> = ({ zoneId, pondId, cycleId, ponds }) => {
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 3;

    const { data: response, isLoading: queryLoading } = useStockTransferStats({
        ZoneId: zoneId,
        Id: pondId,
        CycleId: cycleId,
    });

    const isLoading = isSectionOpen && queryLoading;

    // Map API data to UI format
    const dataList = React.useMemo(() => {
        if (!response?.data?.items) return [];

        const getPondName = (code: string | null) => {
            if (!code) return 'N/A';
            // Search by code or by id just in case the API returns id in that field
            const pond = ponds?.find(p => p.code === code || p.id === code);
            return pond?.name || code; // Fallback to code if name not found
        };

        return response.data.items.map(record => ({
            id: record.recordId,
            sourcePond: getPondName(record.fromPondCode),
            targetPond: getPondName(record.toPondCode),
            transferDate: formatDate(record.transferDate),
            doc: record.doc,
            amount: record.transferQuantity.toLocaleString(),
            size: record.shrimpCountPerKg.toString(),
            stockingDate: formatDate(record.releaseDate),
            stockingAmount: record.releaseQuantity.toLocaleString(),
            expectedAmount: record.estimatedShrimpCount.toLocaleString(),
        }));
    }, [response, ponds]);

    const toggleSection = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSectionOpen(!isSectionOpen);
    };

    const toggleShowAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAll(!showAll);
    };

    const displayedData = showAll ? dataList : dataList.slice(0, INITIAL_SHOW_COUNT);

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
        paddingVertical: 8,
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
