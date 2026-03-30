import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { Loading } from '@/shared/components/ui/Loading';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import type { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { HealthCheckResult } from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthSummarySection } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthSummarySection';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { ShrimpHealthDetailsModal } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthDetailsModal';
import {
    HealthCheckListSection,
    HealthCheckEntry,
} from '@/features/farm/components/ai-shrimp-health/HealthCheckListSection';

interface Props {
    isLoading: boolean;
    results: HealthCheckResult[];
    currentResult: HealthCheckResult | null;
    previousResult: HealthCheckResult | null;
    countTimes: number;
    imageUri: string | null;
    detections: HealthDetectionBox[];
    imageDimensions: { width: number; height: number };
    displayDimensions: { width: number; height: number };
    onBackPress: () => void;
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onResetPress: () => void;
    onGetResultPress: () => void;
    onAnalyzeImagePress: () => void;
    onShowDetailsPress: () => void;
    isSheetVisible: boolean;
    onCloseSheet: () => void;
    isResetModalVisible: boolean;
    onConfirmReset: () => void;
    onCancelReset: () => void;
    onImageAreaLayout: (size: { width: number; height: number }) => void;
    hasAnalyzedCurrent: boolean;
    checkEntries: HealthCheckEntry[];
    onViewCheckEntry: (entry: HealthCheckEntry) => void;
    selectedEntry: HealthCheckEntry | null;
}

export const ShrimpHealthAIForm: React.FC<Props> = ({
    isLoading,
    results,
    currentResult,
    previousResult,
    countTimes,
    imageUri,
    detections: _detections,
    imageDimensions,
    displayDimensions,
    onBackPress,
    onImageSelect,
    onResetPress,
    onGetResultPress,
    onAnalyzeImagePress,
    onShowDetailsPress,
    isSheetVisible,
    onCloseSheet,
    isResetModalVisible,
    onConfirmReset,
    onCancelReset,
    onImageAreaLayout,
    hasAnalyzedCurrent,
    checkEntries,
    onViewCheckEntry,
    selectedEntry,
}) => {
    return (
        <View style={styles.container}>
            <HeaderSection title="AI chẩn đoán tôm" onBack={onBackPress} />

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
                        {/* Overlay removed: processed images from AI server already contain annotations */}
                    </SelectionInfoBox>
                    <SelectionInfoBox title="Kết quả kiểm tra từ AI" style={{ marginTop: 0 }}>
                        <ShrimpHealthSummarySection
                            results={results}
                            currentResult={currentResult}
                            previousResult={previousResult}
                            onShowDetailsPress={onShowDetailsPress}
                            countTimes={countTimes}
                            showAddMore={
                                countTimes >= 2 || (countTimes === 1 && !hasAnalyzedCurrent)
                            }
                            onAddMore={onAnalyzeImagePress}
                        />
                    </SelectionInfoBox>

                    {/* Check History List */}
                    {checkEntries.length > 0 && (
                        <HealthCheckListSection
                            entries={checkEntries}
                            onViewEntry={onViewCheckEntry}
                        />
                    )}
                </ScrollView>
            </Loading>

            <View style={styles.countWrapper}>
                <Text style={styles.countLabel}>Số lần kiểm tra</Text>
                <Text style={styles.countValue}>{countTimes}</Text>
            </View>
            {countTimes === 0 ? (
                <ButtonBar
                    mode="single"
                    primaryTitle="Bắt đầu chuẩn đoán"
                    onPrimaryPress={onAnalyzeImagePress}
                    primaryButtonDisabled={!imageUri}
                />
            ) : (
                <ButtonBar
                    mode="double"
                    equalWidth
                    secondaryTitle="Kiểm tra lại"
                    primaryTitle="Lấy kết quả này"
                    onSecondaryPress={onResetPress}
                    onPrimaryPress={onGetResultPress}
                />
            )}

            <ShrimpHealthDetailsModal
                visible={isSheetVisible}
                entry={selectedEntry}
                items={selectedEntry?.result.items || []}
                onClose={onCloseSheet}
            />

            <ConfirmationModalUI
                visible={isResetModalVisible}
                onConfirm={onConfirmReset}
                onCancel={onCancelReset}
                title="Kiểm tra lại"
                message="Bạn có chắc chắn muốn kiểm tra lại không? Dữ liệu hiện tại sẽ bị xóa."
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
    countWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    countLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    countValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    card: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
});
