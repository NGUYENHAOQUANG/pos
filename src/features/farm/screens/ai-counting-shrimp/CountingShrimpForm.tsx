import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { Image } from 'react-native';
import { DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import type { CountingResult } from '@/features/farm/hooks/useCountingShrimp';
import { CountingResultSection } from '@/features/farm/components/ai-counting-shrimp/CountingResultSection';
import { CountingImageSection } from '@/features/farm/components/ai-counting-shrimp/CountingImageSection';
import { CountingActionButtons } from '@/features/farm/components/ai-counting-shrimp/CountingActionButtons';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';

export interface CountingShrimpFormProps {
    isLoading: boolean;
    lastCountingResult: CountingResult | null;
    onRequestStartCounting: (base64Content: string, imageUri: string) => void;
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
    const [result, setResult] = useState<string>('0');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [countTimes, setCountTimes] = useState(0);
    const [previousTotal, setPreviousTotal] = useState(0);
    const [isCountAdded, setIsCountAdded] = useState(false);
    const [currentImageCount, setCurrentImageCount] = useState<number>(0);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [isProcessed, setIsProcessed] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [detections, setDetections] = useState<DetectionDot[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });

    const handleImageSelect = useCallback(
        (
            uri: string,
            base64?: string,
            _file?: { fileName: string; type: string },
            dimensions?: { width: number; height: number }
        ) => {
            onImageChange();
            setImageUri(uri);
            if (base64) setBase64Image(base64);
            if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
                setImageDimensions(dimensions);
            } else {
                Image.getSize(
                    uri,
                    (width, height) => setImageDimensions({ width, height }),
                    err => console.error('Failed to get image size:', err)
                );
            }
            setDetections([]);
            setCurrentImageCount(0);
            setIsCountAdded(false);
            setIsProcessed(false);
        },
        [onImageChange]
    );

    const handleImageRemove = useCallback(() => {
        onImageChange();
        setImageUri(null);
        setBase64Image(null);
        setDetections([]);
        setCurrentImageCount(0);
        setIsCountAdded(false);
        setIsProcessed(false);
        setImageDimensions({ width: 1, height: 1 });
    }, [onImageChange]);

    useEffect(() => {
        if (lastCountingResult) {
            setCurrentImageCount(lastCountingResult.count);
            setDetections(lastCountingResult.detections);
            setIsProcessed(true);
        }
    }, [lastCountingResult]);

    const handleRequestStartCounting = useCallback(() => {
        if (!base64Image || !imageUri) return;
        onRequestStartCounting(base64Image, imageUri);
    }, [base64Image, imageUri, onRequestStartCounting]);

    const handleGetCount = useCallback(() => {
        if (!imageUri) return;
        if (isCountAdded) return;
        if (countTimes === 0) {
            setPreviousTotal(0);
            setResult(currentImageCount.toString());
            setCountTimes(1);
        } else {
            const currentTotal = parseInt(result || '0', 10);
            setPreviousTotal(currentTotal);
            setResult(String(currentTotal + currentImageCount));
            setCountTimes(prev => prev + 1);
        }
        setIsCountAdded(true);
    }, [imageUri, isCountAdded, countTimes, result, currentImageCount]);

    const handleReset = useCallback(() => setIsConfirmVisible(true), []);

    const handleConfirmReset = useCallback(() => {
        if (currentImageCount > 0) {
            setResult(currentImageCount.toString());
            setCountTimes(1);
            setPreviousTotal(0);
            setIsCountAdded(true);
        } else {
            setResult('0');
            setCountTimes(0);
            setPreviousTotal(0);
            setIsCountAdded(false);
        }
        setIsConfirmVisible(false);
    }, [currentImageCount]);

    const handleSecondaryAction = useCallback(() => {
        if (!imageUri) {
            Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn ảnh trước khi lấy số lượng.');
            return;
        }
        if (isCountAdded) return;
        handleGetCount();
    }, [imageUri, isCountAdded, handleGetCount]);

    const isStartCountingMode = !isProcessed;
    const isSecondaryDisabled = isStartCountingMode
        ? !imageUri
        : isCountAdded || currentImageCount === 0;
    const secondaryButtonLabel = isStartCountingMode
        ? 'Bắt đầu đếm'
        : countTimes === 0
        ? `Lấy số lượng${currentImageCount > 0 ? ` (${currentImageCount})` : ''}`
        : `Cộng dồn (${currentImageCount})`;

    return (
        <View style={styles.container}>
            <Loading isLoading={isLoading}>
                <HeaderFarm title="Kiểm đếm tôm giống bằng AI" onBack={onBack} type="simple" />

                <View style={styles.content}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <CountingResultSection result={result} previousTotal={previousTotal} />

                            <CountingImageSection
                                imageUri={imageUri}
                                detections={detections}
                                imageDimensions={imageDimensions}
                                displayDimensions={displayDimensions}
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleImageRemove}
                                onLayoutDisplay={(width, height) =>
                                    setDisplayDimensions({ width, height })
                                }
                            />

                            <CountingActionButtons
                                countTimes={countTimes}
                                isSecondaryDisabled={isSecondaryDisabled}
                                secondaryButtonLabel={secondaryButtonLabel}
                                onReset={handleReset}
                                onSecondaryPress={
                                    isStartCountingMode
                                        ? handleRequestStartCounting
                                        : handleSecondaryAction
                                }
                            />

                            <ConfirmationModal
                                visible={isConfirmVisible}
                                onConfirm={handleConfirmReset}
                                onCancel={() => setIsConfirmVisible(false)}
                                type="counting_reset"
                            />
                        </View>
                    </ScrollView>
                </View>

                <ButtonBarFarm
                    primaryTitle="Lưu và Quay lại"
                    secondaryTitle="Hủy"
                    onPrimaryPress={() => onSave(result)}
                    onSecondaryPress={onBack}
                    secondaryType="default"
                />
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
    card: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: 8,
    },
});
