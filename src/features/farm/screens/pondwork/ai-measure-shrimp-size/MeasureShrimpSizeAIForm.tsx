import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { Loading } from '@/shared/components/ui/Loading';
import { Button } from '@/shared/components/buttons/Button';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import type { MeasurementDetectionBox } from '@/features/farm/components/boderbox/ShrimpMeasurementBoundingBoxOverlay';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
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
    onShowSheet: () => void;
    onCloseSheet: () => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
    weight: string;
    onWeightChange: (value: string) => void;
}

export const MeasureShrimpSizeAIForm: React.FC<Props> = ({
    isLoading,
    measurements,
    currentMeasurement,
    previousMeasurement,
    countTimes,
    averageSizeCm,
    sizePcsPerKg,
    imageUri,
    detections: _detections,
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
    onShowSheet,
    onCloseSheet,
    onImageAreaLayout,
    weight,
    onWeightChange,
}) => {
    const aiCount = currentMeasurement?.count ?? null;
    const sizeShrimp1 =
        currentMeasurement?.sizes && currentMeasurement.sizes.length > 0
            ? currentMeasurement.sizes[0]
            : null;

    const showAddMore = countTimes >= 2 || (countTimes === 1 && !hasAnalyzedCurrent);

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
                        />
                        {/* Bounding box overlay removed: processed images from AI server already contain annotations */}
                    </SelectionInfoBox>
                    <SelectionInfoBox title="Thông tin nhập" style={{ marginTop: 0 }}>
                        <Input
                            label="Khối lượng tôm được đo (g)"
                            placeholder="Nhập khối lượng tôm được đo"
                            value={weight}
                            onChangeText={onWeightChange}
                            keyboardType="numeric"
                            inputFormat={InputFormat.DECIMAL}
                            required
                            maxLength={10}
                            containerStyle={{ marginBottom: 0 }}
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
                                <Text style={styles.summaryLabel}>Cỡ tôm</Text>
                                <Text style={styles.summaryValue}>
                                    {currentMeasurement?.pcsPerKg != null
                                        ? currentMeasurement.pcsPerKg
                                        : '-'}
                                </Text>
                            </View>
                            {measurements.length > 1 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Trung bình cỡ tôm</Text>
                                    <Text style={styles.summaryValue}>
                                        {sizePcsPerKg !== null ? sizePcsPerKg : '-'}
                                    </Text>
                                </View>
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
                                        <Button
                                            title="Đo thêm"
                                            onPress={onAnalyze}
                                            variant="outline"
                                            textStyle={styles.addMoreText}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </SelectionInfoBox>
                </ScrollView>
            </Loading>

            <View style={styles.checkCountRow}>
                <Text style={styles.checkCountLabel}>Số lần đo</Text>
                <Text style={styles.checkCountValue}>{countTimes}</Text>
            </View>
            {countTimes === 0 ? (
                <ButtonBar
                    mode="single"
                    primaryTitle="Bắt đầu đo"
                    onPrimaryPress={onAnalyze}
                    primaryButtonDisabled={!imageUri}
                />
            ) : (
                <ButtonBar
                    mode="double"
                    secondaryTitle="Đo lại"
                    primaryTitle="Lấy kết quả đo"
                    onSecondaryPress={onReset}
                    onPrimaryPress={onSave}
                    primaryButtonDisabled={measurements.length === 0}
                    equalWidth
                />
            )}

            {/* Size details modal */}
            <AnimatedBottomSheet
                visible={isSheetVisible}
                onClose={onCloseSheet}
                containerStyle={styles.sheetContainer}
            >
                {/* Header */}
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetHeaderTitle}>Lần đo {countTimes}</Text>
                    <TouchableOpacity
                        onPress={onCloseSheet}
                        activeOpacity={0.7}
                        style={styles.closeButton}
                    >
                        <CloseIcon width={24} height={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Items list */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetListContent}
                >
                    {currentMeasurement?.sizes.map((size, index) => (
                        <View key={index} style={styles.sheetItemCard}>
                            <Text style={styles.sheetItemLabel}>Tôm {index + 1}</Text>
                            <View style={styles.sizePill}>
                                <Text style={styles.sizePillText}>{size.toFixed(2)} cm</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Footer */}
                <View style={styles.sheetFooter}>
                    <Button title="Đóng" variant="outline" onPress={onCloseSheet} />
                </View>
            </AnimatedBottomSheet>

            <ConfirmationModalUI
                visible={isResetModalVisible}
                onConfirm={onConfirmReset}
                onCancel={onCancelReset}
                title="Đo lại"
                message="Bạn có chắc chắn muốn đo lại không? Dữ liệu hiện tại sẽ bị xóa."
                confirmText="Đồng ý"
                cancelText="Hủy"
                showSuccessToast={false}
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
        marginTop: 4,
        marginBottom: 4,
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
        color: colors.text,
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
        paddingTop: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
    sheetContainer: {
        maxHeight: '70%',
        borderRadius: 24,
        margin: 16,
        paddingBottom: 24,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sheetHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    sheetListContent: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    sheetItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    sheetItemLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    sizePill: {
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderWidth: 1,
        backgroundColor: colors.green[25],
        borderColor: colors.green[200],
    },
    sizePillText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.green[600],
    },
    sheetFooter: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
});
