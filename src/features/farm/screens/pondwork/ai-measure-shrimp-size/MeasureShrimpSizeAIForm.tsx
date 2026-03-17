import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { Loading } from '@/shared/components/ui/Loading';
import { Button } from '@/shared/components/buttons/Button';
import { Input } from '@/shared/components/forms/Input';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import {
    ShrimpMeasurementBoundingBoxOverlay,
    MeasurementDetectionBox,
} from '@/features/farm/components/boderbox/ShrimpMeasurementBoundingBoxOverlay';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { formatDecimalInput } from '@/shared/utils/formatters';
import InfoIcon from '@/assets/Icon/information-circle.svg';
import Toast from 'react-native-toast-message';
import type { Measurement } from './MeasureShrimpSizeAIScreen';

interface Props {
    isLoading: boolean;
    measurements: Measurement[];
    currentMeasurement: Measurement | null;
    previousMeasurement: Measurement | null;
    countTimes: number;
    averageSizeCm: number | null;
    sizePcsPerKg: number | null;
    measuredWeight: string;
    imageUri: string | null;
    detections: MeasurementDetectionBox[];
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    hasAnalyzedCurrent: boolean;
    isSheetVisible: boolean;
    isResetModalVisible: boolean;
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onAnalyze: () => void;
    onReset: () => void;
    onConfirmReset: () => void;
    onCancelReset: () => void;
    onSave: () => void;
    onBack: () => void;
    onWeightChange: (text: string) => void;
    onShowSheet: () => void;
    onCloseSheet: () => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
}

export const MeasureShrimpSizeAIForm: React.FC<Props> = ({
    isLoading,
    measurements,
    currentMeasurement,
    previousMeasurement,
    countTimes,
    averageSizeCm,
    sizePcsPerKg,
    measuredWeight,
    imageUri,
    detections,
    imageDimensions,
    displayDimensions,
    hasAnalyzedCurrent,
    isSheetVisible,
    isResetModalVisible,
    onImageSelect,
    onAnalyze,
    onReset,
    onConfirmReset,
    onCancelReset,
    onSave,
    onBack,
    onWeightChange,
    onShowSheet,
    onCloseSheet,
    onImageAreaLayout,
}) => {
    const insets = useSafeAreaInsets();

    const aiCount = currentMeasurement?.count ?? null;
    const sizeShrimp1 =
        currentMeasurement?.sizes && currentMeasurement.sizes.length > 0
            ? currentMeasurement.sizes[0]
            : null;

    const showAddMore = countTimes >= 2 || (countTimes === 1 && !hasAnalyzedCurrent);

    const previousAverageSizeCm = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.sizes.length === 0) return 0;
        const total = previousMeasurement.sizes.reduce((sum, s) => sum + s, 0);
        return (total / previousMeasurement.sizes.length).toFixed(2);
    }, [previousMeasurement]);

    const previousSizePcsPerKg = useMemo(() => {
        if (!previousMeasurement || previousMeasurement.weight <= 0) return 0;
        return Math.round((1000 * previousMeasurement.count) / previousMeasurement.weight);
    }, [previousMeasurement]);

    return (
        <View style={styles.container}>
            <HeaderSection title="Đo kích thước & cỡ tôm bằng AI" onBack={onBack} />

            <Loading isLoading={isLoading}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <SelectionInfoBox title="Hình ảnh xử lý" style={{ marginTop: 0 }}>
                        <AIImageProcessingSection
                            imageUri={imageUri}
                            imageDimensions={imageDimensions}
                            displayDimensions={displayDimensions}
                            onImageSelect={onImageSelect}
                            onImageAreaLayout={onImageAreaLayout}
                        >
                            {imageUri && detections.length > 0 && (
                                <ShrimpMeasurementBoundingBoxOverlay
                                    detections={detections}
                                    displayWidth={displayDimensions.width}
                                    displayHeight={
                                        displayDimensions.width /
                                        (imageDimensions.width / imageDimensions.height)
                                    }
                                    originalWidth={imageDimensions.width}
                                    originalHeight={imageDimensions.height}
                                />
                            )}
                        </AIImageProcessingSection>
                    </SelectionInfoBox>

                    <SelectionInfoBox title="Thông tin nhập" style={{ marginTop: 0 }}>
                        <Input
                            label="Khối lượng tôm được đo (g)"
                            value={measuredWeight}
                            onChangeText={text => onWeightChange(formatDecimalInput(text))}
                            placeholder="Nhập khối lượng tôm được đo"
                            keyboardType="numeric"
                            required
                        />
                    </SelectionInfoBox>

                    <SelectionInfoBox title="Kết quả đo từ AI" style={{ marginTop: 0 }}>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    Tổng số lượng tôm được đo - AI
                                </Text>
                                <Text style={styles.summaryValue}>
                                    {aiCount !== null ? aiCount.toString() : '-'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Lần kiểm tra trước</Text>
                                <Text style={styles.summaryValue}>
                                    {previousMeasurement ? previousMeasurement.count : '-'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Kích thước tôm</Text>
                                {sizeShrimp1 !== null && currentMeasurement ? (
                                    <TouchableOpacity
                                        style={[styles.statusPill, styles.statusPillNormal]}
                                        onPress={() => {
                                            if (
                                                currentMeasurement?.sizes &&
                                                currentMeasurement.sizes.length > 0
                                            ) {
                                                onShowSheet();
                                            } else {
                                                Toast.show(ToastMessages.ShrimpMeasurement.NO_DATA);
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[styles.statusText, styles.statusTextNormal]}
                                            numberOfLines={1}
                                        >
                                            Tôm 1: {sizeShrimp1.toFixed(2)} cm... Xem thêm
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.summaryValue}>-</Text>
                                )}
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Trung bình kích thước tôm</Text>
                                <Text style={styles.summaryValue}>
                                    {averageSizeCm !== null ? averageSizeCm : '-'}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Cỡ tôm (con/kg)</Text>
                                <Text style={styles.summaryValue}>
                                    {sizePcsPerKg !== null ? sizePcsPerKg : '-'}
                                </Text>
                            </View>
                            {measurements.length > 1 && (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            TBKTT (cm) lần đo trước
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {previousAverageSizeCm}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            CT (con/kg) lần đo trước
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {previousSizePcsPerKg}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {countTimes > 0 && (
                                <>
                                    <View style={styles.infoBox}>
                                        <InfoIcon width={20} height={20} style={styles.infoIcon} />
                                        <Text style={styles.infoText}>
                                            Bạn có thể chụp thêm hình để đo thêm nếu cần.
                                        </Text>
                                    </View>

                                    {showAddMore && (
                                        <OutlineButton
                                            label="Đo thêm"
                                            onPress={onAnalyze}
                                            labelStyle={styles.addMoreText}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </SelectionInfoBox>
                </ScrollView>
            </Loading>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.checkCountRow}>
                    <Text style={styles.checkCountLabel}>Số lần đo</Text>
                    <Text style={styles.checkCountValue}>{countTimes}</Text>
                </View>
                <View style={styles.buttonRow}>
                    {countTimes === 0 ? (
                        <Button
                            title="Bắt đầu đo"
                            variant="primary"
                            onPress={onAnalyze}
                            style={styles.flexButton}
                            disabled={!imageUri}
                        />
                    ) : (
                        <>
                            <Button
                                title="Đo lại"
                                variant="outline"
                                onPress={onReset}
                                style={[styles.flexButton, { borderColor: colors.border }]}
                                textStyle={{ color: colors.textSecondary }}
                            />
                            <Button
                                title="Lấy kết quả đo"
                                variant="primary"
                                onPress={onSave}
                                style={styles.flexButton}
                                disabled={measurements.length === 0}
                            />
                        </>
                    )}
                </View>
            </View>

            {/* Size details modal */}
            <Modal
                visible={isSheetVisible}
                transparent
                animationType="fade"
                onRequestClose={onCloseSheet}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseSheet}
                >
                    <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIndicator} />
                            <Text style={styles.modalTitle}>
                                Danh sách kích thước tôm - Lần đo {countTimes}
                            </Text>
                        </View>
                        <ScrollView
                            style={styles.modalList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalListContent}
                        >
                            {currentMeasurement?.sizes.map((size, index) => (
                                <Animated.View key={index} style={styles.modalItem}>
                                    <Text style={styles.modalItemLabel}>Tôm {index + 1}</Text>
                                    <Text style={styles.modalItemValue}>{size.toFixed(2)} cm</Text>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            <ConfirmationModal
                visible={isResetModalVisible}
                onConfirm={onConfirmReset}
                onCancel={onCancelReset}
                type="measure_reset"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: 100,
        gap: 8,
    },
    summaryContainer: {
        gap: 12,
        paddingVertical: spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 24,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginLeft: spacing.md,
    },
    infoBox: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        marginVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: colors.border,
        borderWidth: 1,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        lineHeight: 20,
        flex: 1,
    },
    addMoreText: {
        color: colors.textSecondary,
    },
    statusPill: {
        borderRadius: 100,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderWidth: 1,
        marginLeft: spacing.md,
        maxWidth: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusPillNormal: {
        backgroundColor: colors.green[50],
        borderColor: colors.green[200],
    },
    statusTextNormal: {
        color: colors.green[600],
    },
    checkCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: 12,
    },
    checkCountLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    checkCountValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: spacing.md,
    },
    flexButton: {
        flex: 1,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        height: '60%',
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalIndicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    modalList: {
        flex: 1,
    },
    modalListContent: {
        padding: spacing.md,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalItemLabel: {
        fontSize: 16,
        color: colors.text,
    },
    modalItemValue: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
