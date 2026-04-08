/**
 * @file PondTransfer.tsx
 * @description Pond transfer statistics with infinite scroll (optimized for nested ScrollView)
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { TransferItemCard } from './TransferItemCard';
import { useInfiniteStockTransferStats } from '@/features/reports/hooks/useStockTransferStats';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import HarvestStatIcon from '@/assets/Icon/IconReport/HarvestStatIcon.svg';

import { PondTransferProps } from '@/features/reports/types/stock-transfer-stats';

// Wrap item with React.memo for performance
const MemoizedTransferItemCard = React.memo(TransferItemCard);

export const PondTransfer: React.FC<PondTransferProps> = ({ zoneId, pondId, seasonId }) => {
    const chartStyles = useChartStyles();
    const theme = useAppTheme();
    const [isSectionOpen, setIsSectionOpen] = React.useState(false);

    const { dataList, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteStockTransferStats({
            ZoneId: zoneId,
            PondIds: pondId ? [pondId] : undefined,
            SeasonId: seasonId,
            enabled: isSectionOpen,
        });

    const toggleSection = () => {
        setIsSectionOpen(!isSectionOpen);
    };

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<HarvestStatIcon width={20} height={20} />}
                label="Thống kê sang ao"
                style={[
                    styles.sectionHeader,
                    { borderBottomColor: theme.isDark ? '#FFFFFF' : theme.borderLight },
                ]}
                onPress={toggleSection}
                isExpanded={isSectionOpen}
            />

            {isSectionOpen && (
                <View
                    style={[
                        styles.listContainer,
                        { backgroundColor: theme.background },
                        isLoading ? styles.loadingContainer : undefined,
                    ]}
                >
                    {isLoading ? (
                        <Loading />
                    ) : dataList.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu sang ao" />
                    ) : (
                        <>
                            {dataList.map((item, index) => (
                                <MemoizedTransferItemCard key={`${item.id}-${index}`} item={item} />
                            ))}

                            {/* Load more button */}
                            {isFetchingNextPage && (
                                <View style={styles.footerLoader}>
                                    <ActivityIndicator
                                        color={theme.isDark ? '#fb923c' : colors.primary}
                                    />
                                </View>
                            )}

                            {hasNextPage && !isFetchingNextPage && (
                                <TouchableOpacity
                                    style={[
                                        styles.loadMoreButton,
                                        {
                                            backgroundColor: theme.backgroundButton,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                    onPress={handleLoadMore}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.loadMoreText,
                                            { color: theme.textSecondary },
                                        ]}
                                    >
                                        Tải thêm
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
        paddingHorizontal: 16,
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
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadMoreButton: {
        alignSelf: 'stretch',
        height: 40,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
