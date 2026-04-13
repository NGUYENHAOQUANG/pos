import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { DetailRow } from '@/features/material/components/DetailRow';
import { Button } from '@/shared/components/buttons/Button';
import { HarvestSuccessHeader } from './HarvestSuccessHeader';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface HarvestBatchDetailBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    batchNumber?: number;
    weight?: number;
    scaleName?: string;
    scaleCode?: string;
    confirmTime?: string;
    confirmDate?: string;
    confirmerName?: string;
}

export const HarvestBatchDetailBottomSheet: React.FC<HarvestBatchDetailBottomSheetProps> = ({
    visible,
    onClose,
    batchNumber = 5,
    weight = 18.4,
    scaleName = 'Cân 01 — Sân A',
    scaleCode = 'SCD-001',
    confirmTime = '11:24:05',
    confirmDate = '09/04/2026',
    confirmerName = 'Phùng Thanh Độ',
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Mẻ #{batchNumber}</Text>
                        <View style={styles.headerRight}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>Hoàn tất</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.successContainer}>
                        <HarvestSuccessHeader
                            batchNumber={batchNumber}
                            weight={weight}
                            scaleName={scaleName}
                            time={confirmTime}
                        />

                        <View style={styles.successInfoCard}>
                            <DetailRow label="STT mẻ:" value={`#${batchNumber}`} />
                            <DetailRow
                                label="Trọng lượng (net):"
                                value={weight.toFixed(1)}
                                unit="kg"
                            />
                            <DetailRow label="Thời gian xác nhận:" value={confirmTime} />
                            <DetailRow label="Ngày:" value={confirmDate} />
                        </View>

                        <View style={styles.successInfoCard}>
                            <DetailRow label="Cân điện tử:" value={scaleName} />
                            <DetailRow label="Mã cân (SCD):" value={scaleCode} />
                            <DetailRow label="Người xác nhận:" value={confirmerName} />
                        </View>

                        <View style={styles.bottomBarOutline}>
                            <Button
                                variant="outline"
                                title="Quay lại lịch sử mẻ"
                                onPress={onClose}
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
        },
        content: {
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#A8E3C1',
            backgroundColor: theme.background,
        },
        statusBadgeText: {
            fontSize: 13,
            fontWeight: '500',
            color: '#158C4A',
        },
        closeButton: {
            padding: 4,
            marginRight: -4,
        },
        successContainer: {
            alignItems: 'center',
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.sm,
            gap: 8,
        },
        successInfoCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: 12,
            width: '100%',
            gap: spacing.sm,
        },
        bottomBarOutline: {
            width: '100%',
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
        },
    });
