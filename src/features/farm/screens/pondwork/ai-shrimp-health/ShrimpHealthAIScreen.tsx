import React, { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useDocumentUploadV2 } from '@/shared/hooks/useDocumentUpload';
import { usePredictShrimpHealth } from '@/features/farm/hooks/useAI';
import { StorageType } from '@/shared/types/common.types';
import { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import {
    HealthCheckItem,
    HealthCheckResult,
    shrimpHealthAIService,
} from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthAIForm } from './ShrimpHealthAIForm';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { ShrimpHealthStatusLabel } from '@/features/farm/types/ai.types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const ShrimpHealthCheckAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // ── Hooks ────────────────────────────────────
    const { mutate: uploadDoc, isPending: isUploading } = useDocumentUploadV2();
    const { mutate: predictHealth, isPending: isPredicting } = usePredictShrimpHealth();

    // ── State ────────────────────────────────────
    const [results, setResults] = useState<HealthCheckResult[]>([]);
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [hasAnalyzedCurrent, setHasAnalyzedCurrent] = useState(false);
    const [detections, setDetections] = useState<HealthDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });

    // ── Derived ──────────────────────────────────
    const isLoading = isUploading || isPredicting;
    const currentResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    const countTimes = results.length;

    // ── Toast on new results ─────────────────────
    React.useEffect(() => {
        if (results.length > 0) {
            const latest = results[results.length - 1];
            const hasSick = latest.items.some(i => i.status !== 'HEALTHY');
            AppToast(
                hasSick
                    ? TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.SICK
                    : TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.HEALTHY
            );
        }
    }, [results]);

    // ── Handlers ─────────────────────────────────
    const handleImageSelect = (
        uri: string,
        _base64?: string,
        _file?: any,
        dimensions?: { width: number; height: number }
    ) => {
        _setImageUri(uri);
        if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
            setImageDimensions(dimensions);
        }
        setDetections([]);
        setHasAnalyzedCurrent(false);
    };

    const handleGetResult = () => {
        if (!imageUri) {
            AppToast(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.NO_IMAGE);
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

                    // 2. Call AI health prediction
                    predictHealth(
                        { documentId },
                        {
                            onSuccess: response => {
                                const { result: newResult, detections: newDetections } =
                                    shrimpHealthAIService.mapPredictResponse(response);

                                setResults(prev => [...prev, newResult]);
                                setDetections(newDetections);
                                setHasAnalyzedCurrent(true);
                                Toast.show(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.SUCCESS);
                            },
                        }
                    );
                },
            }
        );
    };

    const handleReset = () => {
        setIsResetModalVisible(true);
    };

    const handleConfirmReset = () => {
        _setImageUri(null);
        setResults([]);
        setDetections([]);
        setHasAnalyzedCurrent(false);
        setIsResetModalVisible(false);
    };

    const handleShowDetails = () => {
        if (currentResult?.items && currentResult.items.length > 0) {
            setIsSheetVisible(true);
        } else {
            AppToast(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.NO_DATA);
        }
    };

    const handleSave = () => {
        if (results.length > 0) {
            const allItems = results.reduce<HealthCheckItem[]>(
                (acc, res) => acc.concat(res.items),
                []
            );
            const totalCount = results.reduce((acc, res) => acc + res.totalCount, 0);
            const sickCount = allItems.filter(i => i.status !== 'HEALTHY').length;

            const infectionRate =
                totalCount > 0 ? parseFloat(((sickCount / totalCount) * 100).toFixed(2)) : 0;
            const isHealthy = sickCount === 0;
            const statusString = isHealthy
                ? ShrimpHealthStatusLabel.Healthy
                : ShrimpHealthStatusLabel.Infected;

            const params = {
                aiHealthCheckResult: {
                    totalCount: totalCount,
                    infectionRate: infectionRate,
                    status: statusString,
                    imageUri: imageUri,
                    details: JSON.stringify(allItems),
                },
            };

            navigation.navigate({
                name: 'ShrimpInspectionScreen',
                params,
                merge: true,
            } as any);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
            <ShrimpHealthAIForm
                isLoading={isLoading}
                results={results}
                currentResult={currentResult}
                previousResult={previousResult}
                countTimes={countTimes}
                imageUri={imageUri}
                detections={detections}
                imageDimensions={imageDimensions}
                displayDimensions={displayDimensions}
                onBackPress={navigation.goBack}
                onImageSelect={handleImageSelect}
                onResetPress={handleReset}
                onGetResultPress={handleSave}
                onShowDetailsPress={handleShowDetails}
                onAnalyzeImagePress={handleGetResult}
                isSheetVisible={isSheetVisible}
                onCloseSheet={() => setIsSheetVisible(false)}
                isResetModalVisible={isResetModalVisible}
                onConfirmReset={handleConfirmReset}
                onCancelReset={() => setIsResetModalVisible(false)}
                onImageAreaLayout={size => setDisplayDimensions(size)}
                hasAnalyzedCurrent={hasAnalyzedCurrent}
            />
        </View>
    );
};
