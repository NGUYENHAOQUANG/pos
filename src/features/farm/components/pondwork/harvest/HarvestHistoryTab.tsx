import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HarvestEntryItem } from './HarvestEntryItem';
import { HarvestBatchDetailBottomSheet } from './HarvestBatchDetailBottomSheet';
import { Button } from '@/shared/components/buttons/Button';
import { FilterChips } from '@/shared/components/buttons/FilterChips';
import { HarvestSummaryCards } from './HarvestSummaryCards';
import { AppToast } from '@/features/farm/utils/toastMessages';
import { useScaleRecords, useSoftDeleteScaleRecord } from '@/features/farm/hooks/useScaleRecord';
import {
    formatScaleTime,
    mapScaleRecordToBatchDetail,
} from '@/features/farm/services/pond-work/scale.service';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

import { HarvestScaleMode, HarvestFilterType } from '@/features/farm/types/harvestRecord.types';
import { AddManualScaleBottomSheet } from './AddManualScaleBottomSheet';
import { useScaleStore } from '@/features/farm/store/scaleStore';

export interface HarvestHistoryTabProps {
    scaleMode?: HarvestScaleMode;
    onChangeTotalWeightKg?: (val: number) => void;
    scaleSessionId?: string;
    recordId?: string;
    isEditMode?: boolean;
}

export const HarvestHistoryTab: React.FC<HarvestHistoryTabProps> = ({
    scaleMode,
    onChangeTotalWeightKg,
    scaleSessionId,
    recordId,
    isEditMode,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 12);

    const [activeFilter, setActiveFilter] = useState<HarvestFilterType>(HarvestFilterType.ALL);
    const [batchDetailVisible, setBatchDetailVisible] = useState(false);
    const [selectedBatchItem, setSelectedBatchItem] = useState<any>(null);
    const [isAddManualVisible, setIsAddManualVisible] = useState(false);

    const { manualRecords, addManualRecord, updateManualRecord, deleteManualRecord } =
        useScaleStore();

    const filterOptions = [
        { label: 'Tất cả', value: HarvestFilterType.ALL },
        { label: 'Hoàn tất', value: HarvestFilterType.COMPLETED },
        { label: 'Xóa', value: HarvestFilterType.DELETED },
    ];

    const isManual = scaleMode === HarvestScaleMode.MANUAL;

    const { data: recordsData, isLoading: isRecordsLoadingAPI } = useScaleRecords({
        SessionId: !isEditMode && !isManual ? scaleSessionId : undefined,
        RecordId: isEditMode && !isManual ? recordId : undefined,
    });

    const isRecordsLoading = isManual ? false : isRecordsLoadingAPI;

    const apiEntries = useMemo(() => recordsData?.data?.items || [], [recordsData?.data?.items]);
    const entries = isManual ? manualRecords : apiEntries;

    const { mutate: deleteRecord, isPending: isDeleting } = useSoftDeleteScaleRecord();

    const handleDeleteBatch = (id: string, onClose: () => void) => {
        if (isManual) {
            deleteManualRecord(id);
            const activeWeight = manualRecords
                .filter(r => r.id !== id)
                .reduce((sum, r) => sum + (r.weight || 0), 0);
            onChangeTotalWeightKg?.(activeWeight);
            onClose();
            return;
        }

        deleteRecord(
            { id },
            {
                onSuccess: () => {
                    onClose();
                    AppToast({
                        type: 'success',
                        text1: 'Thành công',
                        text2: 'Đã hủy mẻ cân',
                    } as any);
                },
            }
        );
    };

    const handleSaveManualRecord = (weight: number) => {
        let activeWeight = 0;
        if (selectedBatchItem) {
            updateManualRecord(selectedBatchItem.id, weight);
            activeWeight = manualRecords
                .map(r => (r.id === selectedBatchItem.id ? { ...r, weight } : r))
                .reduce((sum, r) => sum + (r.weight || 0), 0);
        } else {
            const newRecord = {
                id: `manual_${Date.now()}`,
                weight,
                status: 'completed' as const,
                createdAt: new Date().toISOString(),
                batchNo: manualRecords.length + 1,
                scaleName: 'Cân thủ công',
            };
            addManualRecord(newRecord);
            activeWeight = [...manualRecords, newRecord].reduce(
                (sum, r) => sum + (r.weight || 0),
                0
            );
        }
        onChangeTotalWeightKg?.(activeWeight);
        setIsAddManualVisible(false);
        setSelectedBatchItem(null);
    };

    const { totalCount, completedCount, deletedCount, totalWeight, deletedWeight } = useMemo(() => {
        let activeC = 0;
        let delC = 0;
        let activeW = 0;
        let delW = 0;
        entries.forEach(entry => {
            const isDel = entry.status?.toLowerCase() === 'deleted';
            const weight = entry.weight || 0;
            if (isDel) {
                delC++;
                delW += weight;
            } else {
                activeC++;
                activeW += weight;
            }
        });
        return {
            totalCount: entries.length,
            completedCount: activeC,
            deletedCount: delC,
            totalWeight: activeW,
            deletedWeight: delW,
        };
    }, [entries]);

    const filteredEntries = useMemo(() => {
        const filtered = entries.filter(entry => {
            const isDeleted = entry.status?.toLowerCase() === 'deleted';
            if (activeFilter === HarvestFilterType.COMPLETED) return !isDeleted;
            if (activeFilter === HarvestFilterType.DELETED) return isDeleted;
            return true;
        });

        // Sort decreasing (newest first)
        return filtered.sort((a, b) => {
            const timeA = new Date(a.deviceTimestamp || a.createdAt || 0).getTime();
            const timeB = new Date(b.deviceTimestamp || b.createdAt || 0).getTime();
            return timeB - timeA;
        });
    }, [entries, activeFilter]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {isRecordsLoading ? (
                    <ActivityIndicator
                        size="small"
                        color={theme.primary}
                        style={{ marginVertical: 40 }}
                    />
                ) : (
                    <>
                        {isManual ? (
                            <HarvestSummaryCards
                                containerStyle={{ marginTop: 0 }}
                                cards={[
                                    {
                                        label: 'Tổng sản lượng',
                                        value: totalWeight.toFixed(1),
                                        unit: 'kg',
                                    },
                                    {
                                        label: 'Mẻ xác nhận',
                                        value: completedCount.toString(),
                                        unit: 'mẻ',
                                    },
                                ]}
                            />
                        ) : (
                            <>
                                {/* Header text */}
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.headerText}>
                                        <Text style={styles.boldText}>{totalCount}</Text> mẻ -{' '}
                                        <Text style={styles.boldText}>{deletedCount}</Text> đã hủy
                                    </Text>
                                </View>

                                {/* Filters */}
                                <FilterChips
                                    options={filterOptions}
                                    activeValue={activeFilter}
                                    onValueChange={val => setActiveFilter(val as HarvestFilterType)}
                                />

                                {/* Summary Boxes */}
                                <HarvestSummaryCards
                                    containerStyle={{ marginTop: 0 }}
                                    cards={[
                                        {
                                            label: `Tổng (${completedCount} mẻ HT)`,
                                            value: totalWeight.toFixed(1),
                                            unit: 'kg',
                                        },
                                        {
                                            label: `Đã hủy (${deletedCount} mẻ)`,
                                            value: `- ${deletedWeight.toFixed(1)}`,
                                            unit: 'kg',
                                            isError: true,
                                        },
                                    ]}
                                />
                            </>
                        )}

                        <View style={styles.entriesList}>
                            {entries.length === 0 ? (
                                <EmptyStateCard message="Chưa có lịch sử mẻ cân nào" />
                            ) : filteredEntries.length === 0 ? (
                                <EmptyStateCard message="Không tìm thấy mẻ cân phù hợp" />
                            ) : (
                                filteredEntries.map((entry, index) => {
                                    const isDeleted = entry.status?.toLowerCase() === 'deleted';
                                    const timeStr = entry.deviceTimestamp || entry.createdAt;
                                    const timeFormat = formatScaleTime(timeStr);
                                    return (
                                        <HarvestEntryItem
                                            key={entry.id}
                                            index={entry.batchNo || index + 1}
                                            weight={entry.weight}
                                            subtitle={`${entry.scaleName || 'Cân'} - ${timeFormat}`}
                                            status={isDeleted ? 'deleted' : 'completed'}
                                            showDivider={index < filteredEntries.length - 1}
                                            hideBadge={isManual}
                                            onPress={() => {
                                                setSelectedBatchItem(entry);
                                                if (isManual) {
                                                    setIsAddManualVisible(true);
                                                } else {
                                                    setBatchDetailVisible(true);
                                                }
                                            }}
                                        />
                                    );
                                })
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Bottom Bar */}
            {isManual && (
                <View style={[styles.bottomBar, { paddingBottom }]}>
                    <Button
                        title="Cân thêm"
                        variant="outline"
                        fullWidth
                        onPress={() => {
                            setSelectedBatchItem(null);
                            setIsAddManualVisible(true);
                        }}
                    />
                </View>
            )}

            <HarvestBatchDetailBottomSheet
                visible={batchDetailVisible}
                onClose={() => setBatchDetailVisible(false)}
                data={mapScaleRecordToBatchDetail(selectedBatchItem)}
                onDelete={isEditMode ? undefined : handleDeleteBatch}
                isDeleting={isDeleting}
            />

            <AddManualScaleBottomSheet
                visible={isAddManualVisible}
                onClose={() => {
                    setIsAddManualVisible(false);
                    setSelectedBatchItem(null);
                }}
                onConfirm={handleSaveManualRecord}
                batchNo={selectedBatchItem ? selectedBatchItem.batchNo : manualRecords.length + 1}
                initialWeight={selectedBatchItem ? selectedBatchItem.weight : undefined}
                title={
                    selectedBatchItem
                        ? `Cân ${String(selectedBatchItem.batchNo).padStart(2, '0')} — Sân A`
                        : 'Thêm mẻ cân'
                }
                onDelete={
                    selectedBatchItem && !isEditMode
                        ? () =>
                              handleDeleteBatch(selectedBatchItem.id, () => {
                                  setIsAddManualVisible(false);
                                  setSelectedBatchItem(null);
                              })
                        : undefined
                }
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            padding: spacing.md,
            paddingBottom: 40,
            gap: 8,
        },
        headerTextContainer: {
            paddingHorizontal: 4,
        },
        headerText: {
            fontSize: 15,
            color: theme.textSecondary,
        },
        boldText: {
            fontWeight: '600',
            color: theme.text,
        },
        entriesList: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
        },
        bottomBar: {
            paddingTop: 16,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
