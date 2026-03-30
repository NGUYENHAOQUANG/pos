import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Text } from '@/shared/components/typography/Text';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { Loading } from '@/shared/components/ui/Loading';
import type { DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import type { CountingResult } from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpScreens';
import { CountingResultSection } from '@/features/farm/components/ai-counting-shrimp/CountingResultSection';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { AIImagePickerSheet } from '@/features/farm/components/ai-common/AIImagePickerSheet';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { CameraView } from '@/shared/components/camera-cropper';
import { useCameraCapture } from '@/features/farm/hooks/camera-capture/useCameraCapture';
import type { CapturedImage } from '@/features/farm/hooks/camera-capture/useCameraCapture';

export interface CountingShrimpFormProps {
    isLoading: boolean;
    lastCountingResult: CountingResult | null;
    onRequestStartCounting: (imageUri: string) => void;
    onImageChange: () => void;
    onSave: (result: string) => void;
    onBack: () => void;
}

export const CountingShrimpForm: React.FC<CountingShrimpFormProps> = ({
    isLoading,
    lastCountingResult,
    onRequestStartCounting,
    onImageChange,
    onSave,
    onBack,
}) => {
    // ──── Result state ────
    const [result, setResult] = useState('0');
    const [countTimes, setCountTimes] = useState(0);
    const [currentImageCount, setCurrentImageCount] = useState(0);
    const [previousImageCount, setPreviousImageCount] = useState(0);
    const lastCompletedCount = useRef(0);

    // ──── Image state ────
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });
    const [_detections, setDetections] = useState<DetectionDot[]>([]);

    // ──── UI state ────
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isPickerSheetOpen, setIsPickerSheetOpen] = useState(false);

    // ──── Camera logic ────
    const handleImageCaptured = useCallback((img: CapturedImage) => {
        setImageUri(img.uri);
        setProcessedImageUri(null);
        setImageDimensions({ width: img.width, height: img.height });
        setDetections([]);
        setCurrentImageCount(0);
    }, []);

    const camera = useCameraCapture({
        onImageCaptured: handleImageCaptured,
        onImageChange,
    });

    // ──── AIImageProcessingSection callback ────
    const handleImageSelect = useCallback(
        (
            uri: string,
            _base64?: string,
            _file?: { fileName: string; type: string },
            dimensions?: { width: number; height: number }
        ) => {
            onImageChange();
            setImageUri(uri);
            setProcessedImageUri(null);
            if (dimensions?.width && dimensions?.height) {
                setImageDimensions(dimensions);
            } else {
                Image.getSize(
                    uri,
                    (w, h) => setImageDimensions({ width: w, height: h }),
                    err => console.error('Failed to get image size:', err)
                );
            }
            setDetections([]);
            setCurrentImageCount(0);
        },
        [onImageChange]
    );

    // ──── Counting result effect ────
    useEffect(() => {
        if (lastCountingResult && lastCountingResult.count > 0 && currentImageCount === 0) {
            setPreviousImageCount(lastCompletedCount.current);
            setCurrentImageCount(lastCountingResult.count);
            lastCompletedCount.current = lastCountingResult.count;
            setDetections(lastCountingResult.detections);
            setCountTimes(c => c + 1);
            setResult(prev => String(parseInt(prev || '0', 10) + lastCountingResult.count));
            // Use processed image if available
            if (lastCountingResult.processedImageUri) {
                setProcessedImageUri(lastCountingResult.processedImageUri);
            }
            Toast.show(TOAST_MESSAGES_CONFIG.AI_COUNTING.SUCCESS);
        }
    }, [lastCountingResult, currentImageCount]);

    // ──── Actions ────
    const handleRequestStartCounting = useCallback(() => {
        if (!imageUri) {
            return;
        }
        onRequestStartCounting(imageUri);
    }, [imageUri, onRequestStartCounting]);

    const handleReset = useCallback(() => setIsConfirmVisible(true), []);

    const handleConfirmReset = useCallback(() => {
        setResult('0');
        setCountTimes(0);
        setCurrentImageCount(0);
        setPreviousImageCount(0);
        lastCompletedCount.current = 0;
        setDetections([]);
        setImageUri(null);
        setProcessedImageUri(null);
        setImageDimensions({ width: 1, height: 1 });
        setIsConfirmVisible(false);
        onImageChange();
    }, [onImageChange]);

    const handleAddMore = useCallback(() => {
        if (!imageUri) {
            return;
        }
        onRequestStartCounting(imageUri);
    }, [imageUri, onRequestStartCounting]);

    const handleRetakePhoto = useCallback(() => {
        setImageUri(null);
        setDetections([]);
        setCurrentImageCount(0);
        onImageChange();
    }, [onImageChange]);

    const showAddMore = countTimes >= 2 || (countTimes === 1 && currentImageCount === 0);

    // ──── Camera View ────
    if (camera.showCamera) {
        return (
            <CameraView
                cameraRef={camera.cameraRef}
                device={camera.device}
                format={camera.format}
                frameProcessor={camera.frameProcessor}
                isFlashOn={camera.isFlashOn}
                lastPhotoThumb={camera.lastPhotoThumb}
                hasPermission={camera.hasPermission}
                onClose={camera.closeCamera}
                onToggleFlash={camera.toggleFlash}
                onCapture={camera.takePhoto}
                onGallery={(...args) => {
                    camera.closeCamera();
                    handleImageSelect(...args);
                }}
            />
        );
    }

    // ──── Result View ────
    return (
        <View style={styles.container}>
            <Loading isLoading={isLoading}>
                <HeaderFarm title="Kiểm đếm tôm giống bằng AI" onBack={onBack} type="simple" />

                <View style={styles.content}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <SelectionInfoBox title="Hình ảnh xử lý">
                            <AIImageProcessingSection
                                imageUri={processedImageUri || imageUri}
                                imageDimensions={imageDimensions}
                                displayDimensions={displayDimensions}
                                onImageSelect={handleImageSelect}
                                onTakePhoto={camera.openCamera}
                                onOpenPickerSheet={() => setIsPickerSheetOpen(true)}
                                onImageAreaLayout={size => setDisplayDimensions(size)}
                            />
                            {/* DotingOverlay removed: processed images from AI server already contain annotations */}
                        </SelectionInfoBox>

                        <SelectionInfoBox title="Kết quả kiểm tra từ AI">
                            <CountingResultSection
                                result={result}
                                currentCheckCount={currentImageCount}
                                currentImageCount={previousImageCount}
                                countTimes={countTimes}
                                showAddMore={showAddMore}
                                onAddMore={handleAddMore}
                            />
                        </SelectionInfoBox>

                        <ConfirmationModalUI
                            visible={isConfirmVisible}
                            onConfirm={handleConfirmReset}
                            onCancel={() => setIsConfirmVisible(false)}
                            title="Xác nhận đếm lại"
                            message="Đếm lại sẽ ghi đè lên TẤT CẢ các lần đếm trước đó, bạn có chắc chắn muốn đếm lại?"
                            confirmText="Đồng ý"
                            cancelText="Hủy"
                            showSuccessToast={false}
                        />
                    </ScrollView>
                </View>

                <AIImagePickerSheet
                    visible={isPickerSheetOpen}
                    onClose={() => setIsPickerSheetOpen(false)}
                    onOpenCamera={() => {
                        setIsPickerSheetOpen(false);
                        camera.openCamera();
                    }}
                    onOpenGallery={(uri, _region) => {
                        setIsPickerSheetOpen(false);
                        handleImageSelect(uri);
                    }}
                />

                <View style={styles.checkCountRow}>
                    <Text style={styles.checkCountLabel}>Số lần kiểm tra</Text>
                    <Text style={styles.checkCountValue}>{countTimes}</Text>
                </View>
                {countTimes === 0 ? (
                    <ButtonBar
                        mode="double"
                        secondaryTitle="Chụp lại"
                        primaryTitle="Bắt đầu đếm"
                        onSecondaryPress={handleRetakePhoto}
                        onPrimaryPress={handleRequestStartCounting}
                        primaryButtonDisabled={!imageUri}
                        equalWidth
                    />
                ) : (
                    <ButtonBar
                        mode="double"
                        secondaryTitle="Đếm lại"
                        primaryTitle="Lưu kết quả"
                        onSecondaryPress={handleReset}
                        onPrimaryPress={() => onSave(result)}
                        equalWidth
                    />
                )}
            </Loading>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
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
});
