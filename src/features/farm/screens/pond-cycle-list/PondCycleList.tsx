import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { DetailRow } from '@/features/material/components/DetailRow';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { CycleData } from '@/features/farm/types/cycle.types';
import { Tag } from '@/features/farm/components/pond/Tag';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

interface PondCycleDetailContentProps {
    isLoading: boolean;
    displayedCycles: CycleData[];
    getBreedLabel: (cycle: CycleData) => string;
    seasonOptions: DropDownItem[];
    selectedSeason: string;
    setSelectedSeason: (val: string) => void;
    onBack: () => void;
    onPressCycle: (cycleId: string) => void;
}

export const PondCycleDetailContent: React.FC<PondCycleDetailContentProps> = ({
    isLoading,
    displayedCycles,
    getBreedLabel,
    seasonOptions,
    selectedSeason,
    setSelectedSeason,
    onBack,
    onPressCycle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.safeArea}>
            <HeaderSection title="Chu kỳ nuôi" onBack={onBack} />
            <View style={[styles.dropdownContainer, { zIndex: 10, elevation: 10 }]}>
                <DropDownButtonBasic
                    data={seasonOptions}
                    value={seasonOptions.find(o => o.id === selectedSeason) || seasonOptions[0]}
                    onSelect={item => {
                        setSelectedSeason(item.id as string);
                    }}
                    placeholder="Chọn vụ nuôi"
                    showIcon={false}
                />
            </View>
            <SafeInputLayout style={styles.listContainer} contentContainerStyle={styles.container}>
                {isLoading ? (
                    <ActivityIndicator
                        size="large"
                        color={theme.primary}
                        style={{ marginTop: spacing.xl }}
                    />
                ) : displayedCycles.length === 0 ? (
                    <EmptyStateCard message="Chưa có chu kỳ nuôi nào" />
                ) : (
                    displayedCycles.map((cycle, index) => {
                        const dateText = cycle.createdAt
                            ? `${formatDateWithTime(new Date(cycle.createdAt))} - ${
                                  cycle.endDate
                                      ? formatDateWithTime(new Date(cycle.endDate))
                                      : 'nay'
                              }`
                            : '---';
                        const status = cycle.status === 'Completed' ? 'active' : 'preparing';
                        const statusText =
                            cycle.status === 'Completed' ? 'Hoàn thành' : 'Chưa hoàn thành';
                        const doc = pondDetailService.calculateDOC(cycle.createdAt);
                        const breed = getBreedLabel(cycle);

                        return (
                            <View key={cycle.id || index.toString()} style={styles.card}>
                                <TouchableOpacity
                                    style={styles.cardHeader}
                                    activeOpacity={0.7}
                                    onPress={() => onPressCycle(cycle.id || '')}
                                >
                                    <View style={styles.headerLeft}>
                                        <Text style={styles.cycleName}>{cycle.name || '---'}</Text>
                                        <Text style={styles.dateLabel}>{dateText}</Text>
                                    </View>
                                    <View style={styles.headerRight}>
                                        <Tag
                                            status={status}
                                            label={statusText}
                                            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                                        />
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={theme.textSecondary}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <View style={styles.cardContent}>
                                    <DetailRow
                                        label="Ngày nuôi (DOC):"
                                        value={`${doc} ngày`}
                                        isSpaceBetween
                                    />
                                    <DetailRow
                                        label="Số lượng thả (Pls):"
                                        value={
                                            (
                                                cycle.shrimpData?.totalStocking ||
                                                cycle.totalStocking
                                            )?.toLocaleString() || '0'
                                        }
                                        isSpaceBetween
                                    />
                                    <DetailRow
                                        label="Tôm giống:"
                                        value={breed || '---'}
                                        isSpaceBetween
                                    />
                                </View>
                            </View>
                        );
                    })
                )}
            </SafeInputLayout>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        container: {
            padding: spacing.md,
            gap: spacing.sm,
        },
        listContainer: {
            flex: 1,
        },
        emptyText: {
            textAlign: 'center',
            padding: spacing.xl,
            color: theme.textSecondary,
            fontSize: 15,
        },
        dropdownContainer: {
            marginHorizontal: spacing.md,
            marginTop: spacing.sm,
            marginBottom: -8, // Reduce gap between dropdown and list
        },
        card: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
        },
        headerLeft: {
            flex: 1,
            paddingRight: spacing.sm,
        },
        cycleName: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 4,
        },
        dateLabel: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        divider: {
            height: 1,
            backgroundColor: theme.defaultBorder,
        },
        cardContent: {
            padding: 12,
            gap: spacing.sm,
        },
    });
