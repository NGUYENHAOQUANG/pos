import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { DetailRow } from '@/features/material/components/DetailRow';
import { Button } from '@/shared/components/buttons/Button';
import { HarvestSuccessHeader } from './HarvestSuccessHeader';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { BatchDetailViewData } from '@/features/farm/services/pond-work/scale.service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '@/styles';

export interface HarvestBatchDetailBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    data?: BatchDetailViewData | null;
    onDelete?: (id: string, onClose: () => void) => void;
    isDeleting?: boolean;
}

export const HarvestBatchDetailBottomSheet: React.FC<HarvestBatchDetailBottomSheetProps> = ({
    visible,
    onClose,
    data,
    onDelete,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Default fallback values
    const batchNumber = data?.batchNumber ?? 5;
    const weight = data?.weight ?? 18.4;
    const scaleName = data?.scaleName ?? 'Cân 01 — Sân A';
    const scaleCode = data?.scaleCode ?? 'SCD-001';
    const confirmTime = data?.confirmTime ?? '11:24:05';
    const confirmDate = data?.confirmDate ?? '09/04/2026';
    const confirmerName = data?.confirmerName ?? 'Phùng Thanh Độ';
    const status = data?.status ?? 'completed';

    const isDeleted = status === 'deleted';

    const handleDelete = () => {
        if (!data?.id || !onDelete) return;
        onDelete(data.id, onClose);
    };

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>Mẻ #{batchNumber}</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    isDeleted ? styles.statusDeleted : styles.statusCompleted,
                                ]}
                            >
                                <Text
                                    style={
                                        isDeleted
                                            ? styles.statusDeletedText
                                            : styles.statusCompletedText
                                    }
                                >
                                    {isDeleted ? 'Đã hủy' : 'Hoàn tất'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
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

                        <View
                            style={[
                                styles.bottomBarOutline,
                                { gap: spacing.sm, flexDirection: 'row' },
                            ]}
                        >
                            {!isDeleted && onDelete && (
                                <View style={{ flex: 1 }}>
                                    <Button
                                        variant="outline"
                                        title="Xoá"
                                        onPress={handleDelete}
                                        fullWidth
                                        style={{ borderColor: theme.red[500] }}
                                        textStyle={{ color: theme.red[500] }}
                                    />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Button
                                    variant={isDeleted ? 'outline' : 'primary'}
                                    title="Lịch sử cân"
                                    onPress={onClose}
                                    fullWidth
                                />
                            </View>
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
        headerLeft: {
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
        },
        statusCompleted: {
            borderColor: theme.green[200],
            backgroundColor: theme.green[50],
        },
        statusCompletedText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.green[600],
        },
        statusDeleted: {
            borderColor: theme.red[200],
            backgroundColor: theme.red[50],
        },
        statusDeletedText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.red[600],
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
            backgroundColor: theme.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
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
