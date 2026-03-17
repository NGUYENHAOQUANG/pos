import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { Loading } from '@/shared/components/ui/Loading';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import {
    HealthDetectionBox,
    ShrimpHealthBoundingBoxOverlay as HealthDetectionBoxOverlay,
} from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { HealthCheckResult } from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthSummarySection } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthSummarySection';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { ShrimpHealthDetailsModal } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthDetailsModal';

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
}

export const ShrimpHealthAIForm: React.FC<Props> = ({
    isLoading,
    results,
    currentResult,
    previousResult,
    countTimes,
    imageUri,
    detections,
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
}) => {
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, spacing.sm);

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
                        >
                            {imageUri && detections.length > 0 && (
                                <HealthDetectionBoxOverlay
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
                </ScrollView>
            </Loading>

            <View style={[styles.footer, { paddingBottom }]}>
                <View style={styles.countWrapper}>
                    <Text style={styles.countLabel}>Số lần kiểm tra</Text>
                    <Text style={styles.countValue}>{countTimes}</Text>
                </View>
                <View style={styles.buttonRow}>
                    {countTimes === 0 ? (
                        <Button
                            title="Bắt đầu chuẩn đoán"
                            onPress={onAnalyzeImagePress}
                            variant="primary"
                            style={styles.flexButton}
                            disabled={!imageUri}
                        />
                    ) : (
                        <>
                            <Button
                                title="Kiểm tra lại"
                                onPress={onResetPress}
                                variant="outline"
                                style={[styles.flexButton, { borderColor: colors.border }]}
                                textStyle={{ color: colors.textSecondary }}
                            />
                            <Button
                                title="Lấy kết quả này"
                                onPress={onGetResultPress}
                                variant="primary"
                                style={styles.flexButton}
                            />
                        </>
                    )}
                </View>
            </View>

            <ShrimpHealthDetailsModal
                visible={isSheetVisible}
                countTimes={countTimes}
                results={results}
                onClose={onCloseSheet}
            />

            {/* Confirmation Modal for Reset */}
            <ConfirmationModal
                visible={isResetModalVisible}
                onConfirm={onConfirmReset}
                onCancel={onCancelReset}
                type="reset_check"
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
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    countWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
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
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    flexButton: {
        flex: 1,
        borderRadius: 100,
        height: 48,
    },
});
