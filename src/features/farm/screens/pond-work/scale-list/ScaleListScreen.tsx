import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCycleDetail } from '@/features/farm/hooks/useCycle';

import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { ScaleCard, ScaleStatus } from '@/features/farm/components/pondwork/harvest/ScaleCard';
import { AddScaleBottomSheet } from '@/features/farm/components/pondwork/harvest/AddScaleBottomSheet';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { ScaleActionBottomSheet } from '@/features/farm/components/pondwork/harvest/ScaleActionBottomSheet';
import { EmergencyRevokeSuccessBottomSheet } from '@/features/farm/components/pondwork/harvest/EmergencyRevokeSuccessBottomSheet';
import { useScales, useUpdateScaleUsageStatus } from '@/features/farm/hooks/useScales';
import { IScale, ScaleUsageStatus } from '@/features/farm/types/scale.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    mapToScaleStatus,
    getScaleDisplayTitle,
} from '@/features/farm/services/pond-work/scale.service';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

type ScaleListRouteProp = RouteProp<AppStackParamList, 'ScaleListScreen'>;
export const ScaleListScreen: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const route = useRoute<ScaleListRouteProp>();
    const cycleId = route.params?.cycleId;
    const pondId = route.params?.pondId;

    const { data: cycleData } = useCycleDetail(pondId || '', cycleId || '');
    const pondName = cycleData?.data?.pond?.name;

    const [isAddScaleModalVisible, setIsAddScaleModalVisible] = useState(false);
    const [isAddingScale, setIsAddingScale] = useState(false);

    // Scale action modal state
    const [selectedScaleItem, setSelectedScaleItem] = useState<IScale | null>(null);
    const [selectedScaleStatus, setSelectedScaleStatus] = useState<ScaleStatus | null>(null);
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);
    const [isEmergencySuccessVisible, setIsEmergencySuccessVisible] = useState(false);

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { mutateAsync: updateUsageStatus } = useUpdateScaleUsageStatus();

    const {
        data: scalesData,
        isLoading,
        refetch,
        isRefetching,
    } = useScales({
        ZoneId: selectedZoneId || undefined,
        UsageStatus: ScaleUsageStatus.Using,
    });

    const apiScales = scalesData?.data?.items || [];

    const handlePressChevron = useCallback((scale: IScale, status: ScaleStatus) => {
        setSelectedScaleItem(scale);
        setSelectedScaleStatus(status);
        setIsActionModalVisible(true);
    }, []);

    const handleScaleToggle = useCallback(
        (val: boolean, scaleId: string) => {
            if (!val && cycleId) {
                updateUsageStatus({
                    scaleIds: [scaleId],
                    status: ScaleUsageStatus.Free,
                    cycleId: cycleId,
                });
            }
        },
        [updateUsageStatus, cycleId]
    );

    const handleAddScaleSubmit = useCallback(
        async (scaleIds: string[]) => {
            try {
                if (scaleIds.length > 0 && cycleId) {
                    setIsAddingScale(true);
                    await updateUsageStatus({
                        scaleIds,
                        status: ScaleUsageStatus.Using,
                        cycleId: cycleId,
                    });
                    setIsAddScaleModalVisible(false);
                    setTimeout(() => AppToast(TOAST_MESSAGES_CONFIG.SCALE.ADD_SUCCESS), 300);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsAddingScale(false);
            }
        },
        [updateUsageStatus, cycleId]
    );

    return (
        <View style={styles.container}>
            <HeaderMeterial title="Tất cả cân" showBackButton />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => refetch()}
                        colors={[theme.primary]}
                    />
                }
            >
                <View style={styles.listContainer}>
                    {isLoading && !isRefetching ? (
                        <ActivityIndicator style={{ marginTop: 24 }} color={theme.primary} />
                    ) : apiScales.length === 0 ? (
                        <EmptyStateCard
                            message="Không có thiết bị cân nào"
                            style={{ marginTop: 24 }}
                        />
                    ) : (
                        apiScales.map(scale => {
                            const status = mapToScaleStatus(
                                scale.connectionStatus,
                                scale.usageStatus
                            );
                            const title = getScaleDisplayTitle(scale);
                            return (
                                <ScaleCard
                                    key={scale.id}
                                    title={title}
                                    status={status}
                                    weight={scale.type === 'Kg500' ? 0 : 0}
                                    onConfirmPress={() => {}}
                                    onPress={() => handlePressChevron(scale, status)}
                                    onToggle={val => handleScaleToggle(val, scale.id)}
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>

            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <Button
                    title="Thêm cân"
                    variant="outline"
                    fullWidth
                    onPress={() => setIsAddScaleModalVisible(true)}
                />
            </View>

            <AddScaleBottomSheet
                visible={isAddScaleModalVisible}
                onClose={() => setIsAddScaleModalVisible(false)}
                onAddScale={handleAddScaleSubmit}
                zoneId={selectedZoneId || undefined}
                isSubmitting={isAddingScale}
                pondName={pondName}
            />

            <ScaleActionBottomSheet
                visible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                scaleStatus={selectedScaleStatus}
                scale={selectedScaleItem}
                onRevokeEmergency={() => {
                    setIsActionModalVisible(false);
                    setTimeout(() => setIsEmergencySuccessVisible(true), 500);
                }}
            />

            <EmergencyRevokeSuccessBottomSheet
                visible={isEmergencySuccessVisible}
                onClose={() => setIsEmergencySuccessVisible(false)}
                scaleName={selectedScaleItem ? getScaleDisplayTitle(selectedScaleItem) : ''}
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
        },
        listContainer: {
            gap: 6,
        },
        bottomContainer: {
            backgroundColor: theme.background,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
            gap: spacing.md,
        },
    });
