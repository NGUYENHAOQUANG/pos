import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { colors, spacing } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
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
    onSavePress: () => void;
    onCancelPress: () => void;
    onImageSelect: (
        uri: string,
        base64?: string,
        file?: any,
        dimensions?: { width: number; height: number }
    ) => void;
    onImageRemove: () => void;
    onResetPress: () => void;
    onGetResultPress: () => void;
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
    onSavePress,
    onCancelPress,
    onImageSelect,
    onImageRemove,
    onResetPress,
    onGetResultPress,
    onShowDetailsPress,
    isSheetVisible,
    onCloseSheet,
    isResetModalVisible,
    onConfirmReset,
    onCancelReset,
    onImageAreaLayout,
}) => {
    return (
        <View style={styles.container}>
            <HeaderSection title="Kiểm tra sức khỏe tôm bằng AI" onBack={onBackPress} />

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

                        <ShrimpHealthImageSection
                            imageUri={imageUri}
                            detections={detections}
                            imageDimensions={imageDimensions}
                            displayDimensions={displayDimensions}
                            countTimes={countTimes}
                            onImageSelect={onImageSelect}
                            onImageRemove={onImageRemove}
                            onImageAreaLayout={onImageAreaLayout}
                            onResetPress={onResetPress}
                            onGetResultPress={onGetResultPress}
                        />
                    </SelectionInfoBox>
                </ScrollView>
            </Loading>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle="Lưu và Quay lại"
                    secondaryTitle="Hủy"
                    onPrimaryPress={onSavePress}
                    onSecondaryPress={onCancelPress}
                    secondaryType="default"
                />
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
        paddingBottom: spacing.sm,
    },
});
