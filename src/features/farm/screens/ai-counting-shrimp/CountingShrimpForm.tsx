import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Text } from '@/shared/components/typography/Text';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { DotingOverlay, DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import type { CountingResult } from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpScreens';
import { CountingResultSection } from '@/features/farm/components/ai-counting-shrimp/CountingResultSection';
import { AIImageProcessingSection } from '@/features/farm/components/pondwork/AIImageProcessingSection';
import { AIImagePickerSheet } from '@/features/farm/components/ai-common/AIImagePickerSheet';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { Button } from '@/shared/components/buttons/Button';
import { CameraView } from '@/shared/components/camera-cropper';
import { useCameraCapture } from '@/features/farm/hooks/camera-capture/useCameraCapture';
import type { CapturedImage } from '@/features/farm/hooks/camera-capture/useCameraCapture';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });
    const [detections, setDetections] = useState<DetectionDot[]>([]);

    // ──── UI state ────
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isPickerSheetOpen, setIsPickerSheetOpen] = useState(false);
    const insets = useSafeAreaInsets();

    // ──── Camera logic ────
    const handleImageCaptured = useCallback((img: CapturedImage) => {
        setImageUri(img.uri);
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
                        <View style={styles.card}>
                            <SelectionInfoBox title="Hình ảnh xử lý">
                                <AIImageProcessingSection
                                    imageUri={imageUri}
                                    imageDimensions={imageDimensions}
                                    displayDimensions={displayDimensions}
                                    onImageSelect={handleImageSelect}
                                    onTakePhoto={camera.openCamera}
                                    onOpenPickerSheet={() => setIsPickerSheetOpen(true)}
                                    onImageAreaLayout={size => setDisplayDimensions(size)}
                                >
                                    {imageUri && detections.length > 0 && (
                                        <DotingOverlay
                                            detections={detections}
                                            displayWidth={displayDimensions.width}
                                            displayHeight={
                                                imageDimensions.width > 0 &&
                                                imageDimensions.height > 0
                                                    ? displayDimensions.width /
                                                      (imageDimensions.width /
                                                          imageDimensions.height)
                                                    : displayDimensions.width
                                            }
                                            originalWidth={imageDimensions.width}
                                            originalHeight={imageDimensions.height}
                                        />
                                    )}
                                </AIImageProcessingSection>
                            </SelectionInfoBox>

                            <SelectionInfoBox title="Kết quả kiểm tra từ AI">
                                <CountingResultSection
                                    result={result}
                                    currentImageCount={previousImageCount}
                                    countTimes={countTimes}
                                    showAddMore={showAddMore}
                                    onAddMore={handleAddMore}
                                />
                            </SelectionInfoBox>

                            <ConfirmationModal
                                visible={isConfirmVisible}
                                onConfirm={handleConfirmReset}
                                onCancel={() => setIsConfirmVisible(false)}
                                type="counting_reset"
                            />
                        </View>
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

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.checkCountRow}>
                        <Text style={styles.checkCountLabel}>Số lần kiểm tra</Text>
                        <Text style={styles.checkCountValue}>{countTimes}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                        {countTimes === 0 ? (
                            <>
                                <Button
                                    title="Chụp lại"
                                    variant="outline"
                                    onPress={handleRetakePhoto}
                                    style={[styles.flexButton, { borderColor: colors.border }]}
                                    textStyle={{ color: colors.textSecondary }}
                                />
                                <Button
                                    title="Bắt đầu đếm"
                                    variant="primary"
                                    onPress={handleRequestStartCounting}
                                    style={styles.flexButton}
                                    disabled={!imageUri}
                                />
                            </>
                        ) : (
                            <>
                                <Button
                                    title="Đếm lại"
                                    variant="outline"
                                    onPress={handleReset}
                                    style={[styles.flexButton, { borderColor: colors.border }]}
                                    textStyle={{ color: colors.textSecondary }}
                                />
                                <Button
                                    title="Lưu kết quả"
                                    variant="primary"
                                    onPress={() => onSave(result)}
                                    style={styles.flexButton}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Loading>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    content: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    card: { backgroundColor: colors.white, marginTop: 8 },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
    },
    checkCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: 12,
    },
    checkCountLabel: { fontSize: 16, color: colors.textSecondary },
    checkCountValue: { fontSize: 16, fontWeight: '500', color: colors.text },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: spacing.md,
        paddingBottom: 4,
    },
    flexButton: { flex: 1 },
});
