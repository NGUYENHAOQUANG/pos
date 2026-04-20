import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { AddScaleBottomSheet } from './AddScaleBottomSheet';
import { ConfirmScaleBottomSheet } from './ConfirmScaleBottomSheet';
import { HarvestEntryItem } from './HarvestEntryItem';
import { HarvestBatchDetailBottomSheet } from './HarvestBatchDetailBottomSheet';
import { EndScaleSessionBottomSheet } from './EndScaleSessionBottomSheet';
import { DeleteScaleSessionBottomSheet } from './DeleteScaleSessionBottomSheet';
import { Button } from '@/shared/components/buttons/Button';
import { HarvestSummaryCards } from './HarvestSummaryCards';
import { ScaleCard, ScaleStatus } from './ScaleCard';
import { ScaleActionBottomSheet } from './ScaleActionBottomSheet';
import { EmergencyRevokeSuccessBottomSheet } from './EmergencyRevokeSuccessBottomSheet';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useScales, useUpdateScaleUsageStatus } from '@/features/farm/hooks/useScales';
import {
    useScaleRecords,
    useConfirmScaleRecord,
    useFinishScaleSession,
    useSoftDeleteScaleRecord,
    useDiscardScaleSession,
    useStartScaleSession,
} from '@/features/farm/hooks/useScaleRecord';
import { ScaleUsageStatus } from '@/features/farm/types/scale.types';
import {
    mapToScaleStatus,
    getScaleDisplayTitle,
    formatScaleTime,
    mapScaleRecordToBatchDetail,
} from '@/features/farm/services/pond-work/scale.service';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { ActivityIndicator } from 'react-native';

import { ScaleSessionAction } from '@/features/farm/types/harvestRecord.types';

export interface HarvestScaleTabProps {
    onNavigateToHistory?: () => void;
    onNavigateToAllScales?: () => void;
    cycleId?: string;
    scaleSessionId?: string;
    recordId?: string;
    isEditMode?: boolean;
    onSetScaleSessionId?: (id: string | null, action?: ScaleSessionAction) => void;
    pondName?: string;
}

export const HarvestScaleTab: React.FC<HarvestScaleTabProps> = ({
    onNavigateToHistory,
    onNavigateToAllScales,
    cycleId,
    scaleSessionId,
    recordId,
    isEditMode,
    onSetScaleSessionId,
    pondName,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 12);

    const [isAddScaleModalVisible, setIsAddScaleModalVisible] = useState(false);
    const [isAddingScale, setIsAddingScale] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isBatchDetailVisible, setIsBatchDetailVisible] = useState(false);

    // Confirm scale modal state
    const [selectedConfirmWeight, setSelectedConfirmWeight] = useState<number>(0);
    const [selectedConfirmScaleName, setSelectedConfirmScaleName] = useState<string>('Cân');
    const [selectedConfirmScaleItem, setSelectedConfirmScaleItem] = useState<any>(null);

    // Scale action modal state
    const [selectedScaleStatus, setSelectedScaleStatus] = useState<ScaleStatus | null>(null);
    const [selectedScaleItem, setSelectedScaleItem] = useState<any>(null);
    const [selectedBatchItem, setSelectedBatchItem] = useState<any>(null);
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);
    const [isEndSessionVisible, setIsEndSessionVisible] = useState(false);
    const [isEmergencySuccessVisible, setIsEmergencySuccessVisible] = useState(false);

    const zoneId = useFarmStore(state => state.selectedZoneId) ?? undefined;

    const { data: scalesData } = useScales({
        ZoneId: zoneId,
        UsageStatus: ScaleUsageStatus.Using,
    });
    const activeScales = scalesData?.data?.items || [];

    const { data: recordsData, isLoading: isRecordsLoading } = useScaleRecords({
        SessionId: !isEditMode ? scaleSessionId : undefined,
        RecordId: isEditMode ? recordId : undefined,
    });
    const entries = useMemo(() => recordsData?.data?.items || [], [recordsData?.data?.items]);

    const [isDeleteSessionVisible, setIsDeleteSessionVisible] = useState(false);
    const { totalWeight, confirmedBatches } = useMemo(() => {
        const validEntries = entries.filter(entry => entry.status?.toLowerCase() !== 'deleted');
        const weight = validEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
        return { totalWeight: weight, confirmedBatches: validEntries.length };
    }, [entries]);

    const { mutateAsync: updateUsageStatus } = useUpdateScaleUsageStatus();
    const { mutateAsync: confirmRecord } = useConfirmScaleRecord();
    const { mutateAsync: startSession } = useStartScaleSession();
    const { mutateAsync: finishSession } = useFinishScaleSession();
    const { mutateAsync: discardSession } = useDiscardScaleSession();

    const { mutate: deleteRecord, isPending: isDeleting } = useSoftDeleteScaleRecord();

    const handleDeleteBatch = (id: string, onClose: () => void) => {
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

    const handlePressChevron = useCallback((status: ScaleStatus, scaleItem: any) => {
        setSelectedScaleStatus(status);
        setSelectedScaleItem(scaleItem);
        setIsActionModalVisible(true);
    }, []);

    const handleScaleToggle = useCallback(
        (val: boolean, scaleId: string) => {
            if (!val) {
                updateUsageStatus({
                    scaleIds: [scaleId],
                    status: ScaleUsageStatus.Free,
                    cycleId: cycleId!,
                });
            }
        },
        [updateUsageStatus, cycleId]
    );

    const handleConfirmPress = useCallback((scaleItem: any) => {
        const randomWeight = +(Math.random() * (30 - 10) + 10).toFixed(1);
        setSelectedConfirmWeight(randomWeight);
        setSelectedConfirmScaleItem(scaleItem);
        setSelectedConfirmScaleName(getScaleDisplayTitle(scaleItem));
        setIsConfirmModalVisible(true);
    }, []);

    const handleConfirmAction = async () => {
        if (!selectedConfirmScaleItem || !scaleSessionId || !cycleId) {
            throw new Error('Thiếu thông tin để xác nhận');
        }
        await confirmRecord({
            cycleId,
            scaleId: selectedConfirmScaleItem.id,
            sessionId: scaleSessionId,
            weight: selectedConfirmWeight,
            deviceTimestamp: new Date().toISOString(),
        });
    };

    const handleAddScaleSubmit = async (scaleIds: string[]) => {
        if (!cycleId) return;
        setIsAddingScale(true);
        let currentSessionId = scaleSessionId;

        try {
            if (!currentSessionId) {
                const data = await startSession({ cycleId });
                if (data?.data?.sessionId) {
                    currentSessionId = data.data.sessionId;
                    onSetScaleSessionId?.(currentSessionId);
                } else {
                    setIsAddingScale(false);
                    return; // failed
                }
            }

            await updateUsageStatus({
                scaleIds: scaleIds,
                status: ScaleUsageStatus.Using,
                cycleId: cycleId,
            });

            setTimeout(() => {
                setIsAddingScale(false);
                setIsAddScaleModalVisible(false);
                if (onNavigateToAllScales) {
                    onNavigateToAllScales();
                }
                setTimeout(() => AppToast(TOAST_MESSAGES_CONFIG.SCALE.ADD_SUCCESS), 300);
            }, 100);
        } catch (error) {
            setIsAddingScale(false);
            console.log(error);
        }
    };

    const handleFinishSession = async () => {
        if (!scaleSessionId || !cycleId) return;
        try {
            await finishSession({
                sessionId: scaleSessionId,
                cycleId: cycleId,
            });

            setIsEndSessionVisible(false);

            if (onNavigateToHistory) {
                onNavigateToHistory();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsEndSessionVisible(false);
            onSetScaleSessionId?.(null, ScaleSessionAction.FINISH);
        }
    };

    const handleDeleteSession = async () => {
        if (!scaleSessionId) return;

        try {
            await discardSession({ sessionId: scaleSessionId });
            AppToast({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã xóa phiên cân',
            } as any);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleteSessionVisible(false);
            onSetScaleSessionId?.(null, ScaleSessionAction.DELETE);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Top Summaries */}
                <HarvestSummaryCards
                    containerStyle={{ marginTop: 0 }}
                    cards={[
                        { label: 'Tổng sản lượng', value: totalWeight.toFixed(1), unit: 'kg' },
                        { label: 'Mẻ xác nhận', value: confirmedBatches.toString(), unit: 'mẻ' },
                    ]}
                />

                {/* Active Scales Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionTitle}>Cân đang hoạt động</Text>
                            {activeScales.length > 0 && (
                                <View style={styles.badgeContainer}>
                                    <View style={styles.badgeDot} />
                                    <Text style={styles.badgeText}>{activeScales.length} cân</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity onPress={onNavigateToAllScales}>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scale Cards */}
                    <View style={styles.scaleCardSection}>
                        {activeScales.length === 0 ? (
                            <EmptyStateCard
                                message="Không có cân đang bận"
                                style={{ marginVertical: 8 }}
                            />
                        ) : (
                            activeScales.map(scale => {
                                const status = mapToScaleStatus(
                                    scale.connectionStatus,
                                    scale.usageStatus
                                );
                                return (
                                    <ScaleCard
                                        key={scale.id}
                                        title={getScaleDisplayTitle(scale)}
                                        status={status}
                                        weight={0}
                                        onConfirmPress={() => handleConfirmPress(scale)}
                                        onPress={() => handlePressChevron(status, scale)}
                                        onToggle={val => handleScaleToggle(val, scale.id)}
                                    />
                                );
                            })
                        )}
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <Button
                            title="Thêm cân"
                            variant="outline"
                            onPress={() => setIsAddScaleModalVisible(true)}
                            fullWidth
                        />
                    </View>
                </View>

                {/* List of Entries Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionTitle}>Danh sách lần cân</Text>
                        </View>
                        <TouchableOpacity onPress={onNavigateToHistory}>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.entriesList}>
                        {isRecordsLoading ? (
                            <ActivityIndicator
                                size="small"
                                color={theme.primary}
                                style={{ marginVertical: 24 }}
                            />
                        ) : entries.length === 0 ? (
                            <EmptyStateCard
                                message="Chưa có lần cân nào"
                                style={{ marginVertical: 24 }}
                            />
                        ) : (
                            entries.map((entry, index) => {
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
                                        showDivider={index < entries.length - 1}
                                        onPress={() => {
                                            setSelectedBatchItem(entry);
                                            setIsBatchDetailVisible(true);
                                        }}
                                    />
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>

            {entries.length !== 0 && activeScales.length !== 0 && (
                <View
                    style={[
                        styles.bottomBar,
                        { paddingBottom, flexDirection: 'row', gap: spacing.md },
                    ]}
                >
                    {entries.length !== 0 && (
                        <Button
                            title="Xóa phiên cân"
                            variant="outline"
                            style={{ flex: 1 }}
                            onPress={() => setIsDeleteSessionVisible(true)}
                        />
                    )}
                    {activeScales.length !== 0 && (
                        <Button
                            title="Kết thúc phiên cân"
                            variant="outline"
                            style={{ flex: 1 }}
                            onPress={() => setIsEndSessionVisible(true)}
                        />
                    )}
                </View>
            )}

            <AddScaleBottomSheet
                visible={isAddScaleModalVisible}
                onClose={() => setIsAddScaleModalVisible(false)}
                zoneId={zoneId}
                isSubmitting={isAddingScale}
                onAddScale={handleAddScaleSubmit}
                pondName={pondName}
            />

            <ConfirmScaleBottomSheet
                visible={isConfirmModalVisible}
                onClose={() => setIsConfirmModalVisible(false)}
                weight={selectedConfirmWeight}
                scaleName={selectedConfirmScaleName}
                batchNumber={confirmedBatches + 1}
                totalAfterConfirm={totalWeight + selectedConfirmWeight}
                onConfirm={handleConfirmAction}
            />

            <HarvestBatchDetailBottomSheet
                visible={isBatchDetailVisible}
                onClose={() => setIsBatchDetailVisible(false)}
                data={mapScaleRecordToBatchDetail(selectedBatchItem)}
                onDelete={handleDeleteBatch}
                isDeleting={isDeleting}
            />

            <ScaleActionBottomSheet
                visible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                scaleStatus={selectedScaleStatus!}
                scale={selectedScaleItem}
                onRevokeEmergency={() => {
                    setIsActionModalVisible(false);
                    setTimeout(() => setIsEmergencySuccessVisible(true), 500);
                }}
            />

            <EmergencyRevokeSuccessBottomSheet
                visible={isEmergencySuccessVisible}
                onClose={() => setIsEmergencySuccessVisible(false)}
                scaleName="Cân 04 — Sân D"
            />
            <EndScaleSessionBottomSheet
                visible={isEndSessionVisible}
                onClose={() => setIsEndSessionVisible(false)}
                onConfirm={handleFinishSession}
            />

            <DeleteScaleSessionBottomSheet
                visible={isDeleteSessionVisible}
                onClose={() => setIsDeleteSessionVisible(false)}
                onConfirm={handleDeleteSession}
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
            gap: spacing.sm,
            paddingBottom: 40,
        },
        sectionContainer: {
            padding: 12,
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        sectionHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        badgeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            gap: 4,
        },
        badgeDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#34C759', // Green
        },
        badgeText: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.text,
        },
        seeAllText: {
            fontSize: 14,
            color: '#007AFF', // Blue link
            fontWeight: '500',
        },
        scaleCardSection: {
            gap: spacing.sm,
            paddingTop: 12,
        },
        scaleCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        scaleCardTop: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        scaleImage: {
            width: 48,
            height: 48,
            borderRadius: 12,
            marginRight: spacing.sm,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        scaleInfoContainer: {
            flex: 1,
        },
        scaleTitleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        chevronContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        scaleWeightTopValue: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        scaleWeightTopUnit: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        scaleTitle: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 4,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 100,
            alignSelf: 'flex-start',
            borderWidth: 1,
        },
        statusReady: {
            backgroundColor: '#E5F7ED',
            borderColor: '#A8E3C1',
        },
        statusReadyText: {
            color: '#158C4A',
            fontSize: 12,
            fontWeight: '500',
        },
        statusWaiting: {
            backgroundColor: '#FFF4E5',
            borderColor: '#FFD3A3',
        },
        statusWaitingText: {
            color: '#D97706',
            fontSize: 12,
            fontWeight: '500',
        },
        chevronIcon: {
            fontSize: 20,
            color: theme.textSecondary,
        },
        scaleCardBottom: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        scaleWeightContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        scaleWeightValue: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
        },
        scaleWeightUnit: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        entriesList: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
            marginTop: spacing.md,
        },
        bottomBar: {
            paddingTop: 16,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
