import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { Loading } from '@/shared/components/ui/Loading';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { HealthCheckResult } from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthSummarySection } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthSummarySection';
import { ShrimpHealthImageSection } from '@/features/farm/components/ai-shrimp-health/ShrimpHealthImageSection';
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
    onImageRemove: () => void;
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
    onImageRemove,
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
                    <SelectionInfoBox title="Kết quả kiểm tra từ AI">
                        <ShrimpHealthSummarySection
                            results={results}
                            currentResult={currentResult}
                            previousResult={previousResult}
                            onShowDetailsPress={onShowDetailsPress}
                        />
                    </SelectionInfoBox>

                    <SelectionInfoBox title="Hình ảnh xử lý">
                        <ShrimpHealthImageSection
                            imageUri={imageUri}
                            detections={detections}
                            imageDimensions={imageDimensions}
                            displayDimensions={displayDimensions}
                            onImageSelect={onImageSelect}
                            onImageRemove={onImageRemove}
                            onImageAreaLayout={onImageAreaLayout}
                            onGetResultPress={onAnalyzeImagePress}
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
        padding: 0,
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
