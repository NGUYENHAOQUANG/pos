import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useDocumentUploadV2 } from '@/shared/hooks/useDocumentUpload';
import { useEstimateShrimpSize } from '@/features/farm/hooks/useAI';
import { StorageType } from '@/shared/types/common.types';
import { MeasurementDetectionBox } from '@/features/farm/components/boderbox/ShrimpMeasurementBoundingBoxOverlay';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import {
    calcAverageSizeCm,
    calcSizePcsPerKg,
} from '@/features/farm/utils/measurement-calculations.utils';
import { MeasureShrimpSizeAIForm } from '@/features/farm/screens/pondwork/ai-measure-shrimp-size/MeasureShrimpSizeAIForm';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export interface Measurement {
    id: number;
    count: number;
    weight: number;
    sizes: number[];
    pcsPerKg: number;
}

export const MeasureShrimpSizeAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // ── Hooks ────────────────────────────────────
    const { mutate: uploadDoc, isPending: isUploading } = useDocumentUploadV2();
    const { mutate: estimateSize, isPending: isAnalyzing } = useEstimateShrimpSize();

    // ── State ────────────────────────────────────
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [measuredWeight, setMeasuredWeight] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [hasAnalyzedCurrent, setHasAnalyzedCurrent] = useState(false);
    const [detections, setDetections] = useState<MeasurementDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

    // ── Derived ──────────────────────────────────
    const isLoading = isUploading || isAnalyzing;
    const currentMeasurement =
        measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const previousMeasurement =
        measurements.length > 1 ? measurements[measurements.length - 2] : null;
    const countTimes = measurements.length;

    const averageSizeCm = useMemo(() => calcAverageSizeCm(measurements), [measurements]);
    const sizePcsPerKg = useMemo(() => calcSizePcsPerKg(measurements), [measurements]);

    // ── Handlers ─────────────────────────────────
    const handleImageSelect = useCallback(
        (
            uri: string,
            _base64?: string,
            _file?: any,
            dimensions?: { width: number; height: number }
        ) => {
            setImageUri(uri);
            if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
                setImageDimensions(dimensions);
            }
            setDetections([]);
            setHasAnalyzedCurrent(false);
        },
        []
    );

    const handleAnalyze = useCallback(() => {
        const weightVal = parseFloat(measuredWeight);
        if (isNaN(weightVal) || weightVal <= 0) {
            Toast.show(ToastMessages.ShrimpMeasurement.WEIGHT_REQUIRED);
            return;
        }

        if (!imageUri) {
            Toast.show(ToastMessages.ShrimpMeasurement.IMAGE_REQUIRED);
            return;
        }

        // 1. Upload image
        uploadDoc(
            {
                files: [{ uri: imageUri, type: 'image/jpeg' }],
                storageType: StorageType.Azure,
            },
            {
                onSuccess: uploadResult => {
                    const documentId = uploadResult.documents?.[0]?.id;
                    if (!documentId) {
                        Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                        return;
                    }

                    // 2. Call AI estimate size
                    estimateSize(
                        { documentId },
                        {
                            onSuccess: data => {
                                let count = 0;
                                let sizes: number[] = [];
                                let newDetections: MeasurementDetectionBox[] = [];

                                if (data.results && data.results.objects) {
                                    count = data.results.count;
                                    sizes = data.results.objects.map(obj => obj.lengthCm);
                                    newDetections = data.results.objects.map(obj => ({
                                        id: obj.id,
                                        bbox: obj.bbox,
                                        label: `${obj.lengthCm.toFixed(2)} cm`,
                                        confidence: obj.confidence,
                                    }));
                                }

                                const pcsPerKg =
                                    weightVal > 0 ? Math.round((1000 * count) / weightVal) : 0;

                                setMeasurements(prev => [
                                    ...prev,
                                    { id: Date.now(), count, weight: weightVal, sizes, pcsPerKg },
                                ]);
                                setDetections(newDetections);
                                setMeasuredWeight('');
                                setHasAnalyzedCurrent(true);
                                Toast.show(TOAST_MESSAGES_CONFIG.AI_MEASURE.SUCCESS);
                            },
                        }
                    );
                },
            }
        );
    }, [imageUri, measuredWeight, uploadDoc, estimateSize]);

    const handleReset = useCallback(() => {
        setIsResetModalVisible(true);
    }, []);

    const handleConfirmReset = useCallback(() => {
        setIsResetModalVisible(false);
        setImageUri(null);
        setMeasurements([]);
        setMeasuredWeight('');
        setDetections([]);
        setHasAnalyzedCurrent(false);
        Toast.show(ToastMessages.ShrimpMeasurement.RESET_SUCCESS);
    }, []);

    const handleSave = useCallback(() => {
        if (sizePcsPerKg !== null && averageSizeCm !== null) {
            navigation.navigate({
                name: 'MeasureShrimpSizeScreen',
                params: { aiShrimpSize: sizePcsPerKg.toString() },
                merge: true,
            } as any);
        } else {
            navigation.goBack();
        }
    }, [navigation, sizePcsPerKg, averageSizeCm]);

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
                measuredWeight={measuredWeight}
                imageUri={imageUri}
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
                onWeightChange={setMeasuredWeight}
                onShowSheet={() => setIsSheetVisible(true)}
                onCloseSheet={() => setIsSheetVisible(false)}
                onImageAreaLayout={(size: { width: number; height: number }) =>
                    setDisplayDimensions(size)
                }
            />
        </View>
    );
};
