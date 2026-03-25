import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useInferencePredict, useGetInferenceResult } from '@/features/farm/hooks/useAI';
import { useFarmStore } from '@/features/farm/store/farmStore';
import type { ShrimpAnnotation } from '@/features/farm/types/ai.types';
import { MeasurementDetectionBox } from '@/features/farm/components/boderbox/ShrimpMeasurementBoundingBoxOverlay';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import {
    calcAverageSizeCm,
    calcSizePcsPerKg,
} from '@/features/farm/utils/measurement-calculations.utils';
import { MeasureShrimpSizeAIForm } from '@/features/farm/screens/pondwork/ai-measure-shrimp-size/MeasureShrimpSizeAIForm';
import { downloadAzureBlobImage } from '@/shared/utils/azureBlobUrl';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export interface Measurement {
    id: number;
    count: number;
    weight: number;
    sizes: number[];
    pcsPerKg: number;
}

// Polling config for inference result
const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 30;

export const MeasureShrimpSizeAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // ── Hooks ────────────────────────────────────
    const { mutate: predict, isPending: isPredicting } = useInferencePredict();
    const { mutate: getResult, isPending: isFetchingResult } = useGetInferenceResult();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // ── State ────────────────────────────────────
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
    const [hasAnalyzedCurrent, setHasAnalyzedCurrent] = useState(false);
    const [detections, setDetections] = useState<MeasurementDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    // ── Derived ──────────────────────────────────
    const isLoading = isPredicting || isFetchingResult || isPolling;
    const currentMeasurement =
        measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const previousMeasurement =
        measurements.length > 1 ? measurements[measurements.length - 2] : null;
    const countTimes = measurements.length;

    const averageSizeCm = useMemo(() => calcAverageSizeCm(measurements), [measurements]);
    const sizePcsPerKg = useMemo(() => calcSizePcsPerKg(measurements), [measurements]);

    // Display the processed image (with bounding boxes) if available, otherwise original
    const displayImageUri = processedImageUri || imageUri;

    // ── Polling for inference result ──────────────
    const pollForResult = useCallback(
        (requestId: string, weightVal: number, attempt: number = 0) => {
            if (attempt >= MAX_POLLING_ATTEMPTS) {
                setIsPolling(false);
                Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                return;
            }

            setTimeout(() => {
                getResult(requestId, {
                    onSuccess: async data => {
                        // Check if processing is complete
                        if (data.status === 'Success' && data.imageProcessedUrl) {
                            setIsPolling(false);

                            // Download processed image to local cache
                            const localImageUri = await downloadAzureBlobImage(
                                data.imageProcessedUrl
                            );

                            if (localImageUri) {
                                setProcessedImageUri(localImageUri);
                            }

                            // Parse annotations from JSON string
                            let annotations: ShrimpAnnotation[] = [];
                            try {
                                annotations = JSON.parse(data.annotationJson || '[]');
                            } catch {
                                annotations = [];
                            }

                            const count = annotations.length;
                            const sizes = annotations.map(a => a.length_cm);
                            const newDetections: MeasurementDetectionBox[] = annotations.map(a => ({
                                id: a.id,
                                bbox: a.bbox,
                                label: `${a.length_cm.toFixed(2)} cm`,
                                confidence: a.confidence,
                            }));

                            const pcsPerKg =
                                weightVal > 0 ? Math.round((1000 * count) / weightVal) : 0;

                            setMeasurements(prev => [
                                ...prev,
                                { id: Date.now(), count, weight: weightVal, sizes, pcsPerKg },
                            ]);
                            setDetections(newDetections);
                            setHasAnalyzedCurrent(true);
                            Toast.show(TOAST_MESSAGES_CONFIG.AI_MEASURE.SUCCESS);
                        } else if (data.status === 'Failed') {
                            // Processing failed
                            setIsPolling(false);
                            Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                        } else {
                            // Still processing, continue polling
                            pollForResult(requestId, weightVal, attempt + 1);
                        }
                    },
                    onError: () => {
                        // Retry on error
                        pollForResult(requestId, weightVal, attempt + 1);
                    },
                });
            }, POLLING_INTERVAL_MS);
        },
        [getResult]
    );

    // ── Handlers ─────────────────────────────────
    const handleImageSelect = useCallback(
        (
            uri: string,
            _base64?: string,
            _file?: unknown,
            dimensions?: { width: number; height: number }
        ) => {
            setImageUri(uri);
            setProcessedImageUri(null);
            if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
                setImageDimensions(dimensions);
            }
            setDetections([]);
            setHasAnalyzedCurrent(false);
        },
        []
    );

    const handleAnalyze = useCallback(() => {
        if (!imageUri) {
            Toast.show(ToastMessages.ShrimpMeasurement.IMAGE_REQUIRED);
            return;
        }

        if (!selectedZoneId) {
            Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
            return;
        }

        const weightVal = 0; // AI handles weight measurement

        // Step 1: Upload image via inference predict endpoint
        predict(
            {
                Image: {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `shrimp_${Date.now()}.jpg`,
                },
                ZoneId: selectedZoneId,
                ModuleId: 'module2',
                ClientTimestamp: new Date().toISOString(),
            },
            {
                onSuccess: predictResult => {
                    if (!predictResult.requestId) {
                        Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                        return;
                    }

                    // Step 2: Poll for inference result
                    setIsPolling(true);
                    pollForResult(predictResult.requestId, weightVal);
                },
            }
        );
    }, [imageUri, selectedZoneId, predict, pollForResult]);

    const handleReset = useCallback(() => {
        setIsResetModalVisible(true);
    }, []);

    const handleConfirmReset = useCallback(() => {
        setIsResetModalVisible(false);
        setImageUri(null);
        setProcessedImageUri(null);
        setMeasurements([]);
        setDetections([]);
        setHasAnalyzedCurrent(false);
        Toast.show(ToastMessages.ShrimpMeasurement.RESET_SUCCESS);
    }, []);

    const handleSave = useCallback(() => {
        if (averageSizeCm !== null && measurements.length > 0) {
            navigation.navigate({
                name: 'MeasureShrimpSizeScreen',
                params: { aiShrimpSize: averageSizeCm.toString() },
                merge: true,
            } as never);
        } else {
            navigation.goBack();
        }
    }, [navigation, averageSizeCm, measurements]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
            <MeasureShrimpSizeAIForm
                isLoading={isLoading}
                measurements={measurements}
                currentMeasurement={currentMeasurement}
                previousMeasurement={previousMeasurement}
                countTimes={countTimes}
                averageSizeCm={averageSizeCm}
                sizePcsPerKg={sizePcsPerKg}
                imageUri={displayImageUri}
                detections={detections}
                imageDimensions={imageDimensions}
                displayDimensions={displayDimensions}
                hasAnalyzedCurrent={hasAnalyzedCurrent}
                isSheetVisible={isSheetVisible}
                isResetModalVisible={isResetModalVisible}
                onImageSelect={handleImageSelect}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                onConfirmReset={handleConfirmReset}
                onCancelReset={() => setIsResetModalVisible(false)}
                onSave={handleSave}
                onBack={navigation.goBack}
                onShowSheet={() => setIsSheetVisible(true)}
                onCloseSheet={() => setIsSheetVisible(false)}
                onImageAreaLayout={(size: { width: number; height: number }) =>
                    setDisplayDimensions(size)
                }
            />
        </View>
    );
};
