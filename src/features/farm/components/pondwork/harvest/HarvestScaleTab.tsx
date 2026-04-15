import React, { useState } from 'react';
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
import { Button } from '@/shared/components/buttons/Button';
import { HarvestSummaryCards } from './HarvestSummaryCards';
import { ScaleCard, ScaleStatus } from './ScaleCard';
import { ScaleActionBottomSheet } from './ScaleActionBottomSheet';
import { EmergencyRevokeSuccessBottomSheet } from './EmergencyRevokeSuccessBottomSheet';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';

export interface HarvestScaleTabProps {
    onNavigateToHistory?: () => void;
    onNavigateToAllScales?: () => void;
}

export const HarvestScaleTab: React.FC<HarvestScaleTabProps> = ({
    onNavigateToHistory,
    onNavigateToAllScales,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 12);

    const [isAddScaleModalVisible, setIsAddScaleModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isBatchDetailVisible, setIsBatchDetailVisible] = useState(false);

    // Scale action modal state
    const [selectedScaleStatus, setSelectedScaleStatus] = useState<ScaleStatus | null>(null);
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);
    const [isEmergencySuccessVisible, setIsEmergencySuccessVisible] = useState(false);

    const handlePressChevron = (status: ScaleStatus) => {
        setSelectedScaleStatus(status);
        setIsActionModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Top Summaries */}
                <HarvestSummaryCards
                    containerStyle={{ marginTop: 0 }}
                    cards={[
                        { label: 'Tổng sản lượng', value: '65.6', unit: 'kg' },
                        { label: 'Mẻ xác nhận', value: '4', unit: 'mẻ' },
                    ]}
                />

                {/* Active Scales Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionTitle}>Cân đang hoạt động</Text>
                            <View style={styles.badgeContainer}>
                                <View style={styles.badgeDot} />
                                <Text style={styles.badgeText}>2 cân</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onNavigateToAllScales}>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scale Cards */}
                    <View style={styles.scaleCardSection}>
                        {/* Scale Card 1: Sẵn sàng cân */}
                        <ScaleCard
                            title="Cân 01 — Sân A"
                            status={ScaleStatus.READY}
                            weight={65.6}
                            onConfirmPress={() => setIsConfirmModalVisible(true)}
                            onPress={() => handlePressChevron(ScaleStatus.READY)}
                        />

                        {/* Scale Card 2: Chờ ổn định */}
                        <ScaleCard
                            title="Cân 02 — Sân B"
                            status={ScaleStatus.WAITING}
                            weight={65.6}
                            onConfirmPress={() => setIsConfirmModalVisible(true)}
                            onPress={() => handlePressChevron(ScaleStatus.WAITING)}
                        />
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
                        {/* Item 1 */}
                        <HarvestEntryItem
                            index="1"
                            weight={18.1}
                            subtitle="Cân 01 - 11:06"
                            onPress={() => setIsBatchDetailVisible(true)}
                        />
                        {/* Item 2 */}
                        <HarvestEntryItem
                            index="2"
                            weight={13.1}
                            subtitle="Cân 02 - 10:58"
                            showDivider={false}
                            onPress={() => setIsBatchDetailVisible(true)}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom }]}>
                <Button title="Kết thúc phiên cân" variant="outline" fullWidth onPress={() => {}} />
            </View>

            <AddScaleBottomSheet
                visible={isAddScaleModalVisible}
                onClose={() => setIsAddScaleModalVisible(false)}
                onAddScale={_scaleId => {
                    // Cần có setTimeout để đợi animation đóng của bottom sheet
                    setTimeout(() => {
                        setIsAddScaleModalVisible(false);
                        if (onNavigateToAllScales) {
                            onNavigateToAllScales();
                        }
                        setTimeout(() => AppToast(TOAST_MESSAGES_CONFIG.SCALE.ADD_SUCCESS), 300);
                    }, 100);
                }}
            />

            <ConfirmScaleBottomSheet
                visible={isConfirmModalVisible}
                onClose={() => setIsConfirmModalVisible(false)}
            />

            <HarvestBatchDetailBottomSheet
                visible={isBatchDetailVisible}
                onClose={() => setIsBatchDetailVisible(false)}
            />

            <ScaleActionBottomSheet
                visible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                scaleStatus={selectedScaleStatus!}
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
