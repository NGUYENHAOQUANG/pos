import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { DropdownMaterial } from '@/features/material/components/DropdownMaterial';
import { DetailRow } from '@/features/material/components/DetailRow';
import { colors, spacing, borderRadius } from '@/styles';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { CycleData } from '@/features/farm/types/cycle.types';
import { DropdownOption } from '@/features/material/components/DropdownMaterial';
import { Tag } from '@/features/farm/components/pond/Tag';

interface PondCycleDetailContentProps {
    isLoading: boolean;
    displayedCycles: CycleData[];
    getBreedLabel: (warehouseItemId: string | undefined) => string | undefined;
    seasonOptions: DropdownOption[];
    selectedSeason: string;
    setSelectedSeason: (val: string) => void;
    dropdownOpen: boolean;
    setDropdownOpen: (val: boolean) => void;
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
    dropdownOpen,
    setDropdownOpen,
    onBack,
    onPressCycle,
}) => {
    console.log('displayedCycles', displayedCycles);
    return (
        <View style={styles.safeArea}>
            <HeaderSection title="Chu kỳ nuôi" onBack={onBack} />
            <View
                style={[
                    styles.dropdownContainer,
                    { zIndex: dropdownOpen ? 10 : 1, elevation: dropdownOpen ? 10 : 1 },
                ]}
            >
                <DropdownMaterial
                    options={seasonOptions}
                    value={selectedSeason}
                    onChange={setSelectedSeason}
                    placeholder="Chọn vụ nuôi"
                    isOpen={dropdownOpen}
                    onToggle={() => setDropdownOpen(!dropdownOpen)}
                    useAutoScroll={true}
                />
            </View>
            <SafeInputLayout style={styles.listContainer} contentContainerStyle={styles.container}>
                {isLoading ? (
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                        style={{ marginTop: spacing.xl }}
                    />
                ) : displayedCycles.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có dữ liệu chu kỳ nuôi</Text>
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
                        const breed = getBreedLabel(cycle.warehouseItemId);

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
                                            color={colors.textSecondary}
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
                                        value={cycle.totalStocking?.toLocaleString() || '0'}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
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
        color: colors.textSecondary,
        fontSize: 15,
    },
    dropdownContainer: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: -8, // Reduce gap between dropdown and list
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
        marginBottom: 4,
    },
    dateLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    cardContent: {
        padding: 12,
        gap: spacing.sm,
    },
});
