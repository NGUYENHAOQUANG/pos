import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '@/styles/themeContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useInferencePredict, useGetInferenceResult } from '@/features/farm/hooks/useAI';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import {
    HealthCheckResult,
    HealthCheckItem,
    shrimpHealthAIService,
    ShrimpHealthApiResponse,
} from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthAIForm } from './ShrimpHealthAIForm';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { downloadAzureBlobImage } from '@/shared/utils/azureBlobUrl';
import type { HealthCheckEntry } from '@/features/farm/components/ai-shrimp-health/HealthCheckListSection';
import { ShrimpHealthStatusLabel } from '@/features/farm/types/ai.types';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Polling config
const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 30;

export const ShrimpHealthCheckAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const theme = useAppTheme();

    // ── Hooks ────────────────────────────────────
    const { mutate: predict, isPending: isPredicting } = useInferencePredict();
    const { mutate: getResult, isPending: isFetchingResult } = useGetInferenceResult();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // ── State ────────────────────────────────────
    const [results, setResults] = useState<HealthCheckResult[]>([]);
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [hasAnalyzedCurrent, setHasAnalyzedCurrent] = useState(false);
    const [detections, setDetections] = useState<HealthDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });
    const [isPolling, setIsPolling] = useState(false);
    const [checkEntries, setCheckEntries] = useState<HealthCheckEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<HealthCheckEntry | null>(null);

    // ── Unsaved changes guard ────────────────────
    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(results.length > 0);

    // ── Derived ──────────────────────────────────
    const isLoading = isPredicting || isFetchingResult || isPolling;
    const currentResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    const countTimes = results.length;

    // Display processed image if available, otherwise original
    const displayImageUri = processedImageUri || imageUri;

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

    // ── Polling for inference result ──────────────
    const pollForResult = useCallback(
        (requestId: string, attempt: number = 0) => {
            if (attempt >= MAX_POLLING_ATTEMPTS) {
                setIsPolling(false);
                Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                return;
            }

            setTimeout(() => {
                getResult(requestId, {
                    onSuccess: async data => {
                        if (data.status === 'Success' && data.imageProcessedUrl) {
                            setIsPolling(false);

                            // Download processed image
                            const localImageUri = await downloadAzureBlobImage(
                                data.imageProcessedUrl
                            );
                            if (localImageUri) {
                                setProcessedImageUri(localImageUri);
                            }

                            // Parse annotations for health results
                            // API returns snake_case: { id, bbox, seg_conf, prediction: { top1_class, top1_conf, all_classes } }
                            // Service expects camelCase: { id, bbox, segConf, prediction: { top1Class, top1Conf } }
                            interface RawHealthAnnotation {
                                id: number;
                                bbox: number[];
                                seg_conf: number;
                                prediction: {
                                    top1_class: string;
                                    top1_conf: number;
                                    all_classes?: Record<string, number>;
                                };
                            }

                            let rawAnnotations: RawHealthAnnotation[] = [];
                            try {
                                const parsed = JSON.parse(data.annotationJson || '[]');
                                console.log(
                                    '[AI Health] annotationJson parsed:',
                                    typeof parsed,
                                    parsed
                                );
                                if (Array.isArray(parsed)) {
                                    rawAnnotations = parsed;
                                } else if (parsed && typeof parsed === 'object') {
                                    const possibleArray =
                                        parsed.detections ||
                                        parsed.results ||
                                        parsed.annotations ||
                                        parsed.data;
                                    if (Array.isArray(possibleArray)) {
                                        rawAnnotations = possibleArray;
                                    }
                                }
                            } catch (_e) {
                                console.warn('[AI Health] Failed to parse annotationJson');
                                rawAnnotations = [];
                            }

                            // Convert snake_case → camelCase for the service
                            const healthResponse: ShrimpHealthApiResponse = {
                                results: rawAnnotations.map(a => ({
                                    id: a.id,
                                    bbox: a.bbox,
                                    segConf: a.seg_conf,
                                    prediction: {
                                        top1Class: a.prediction?.top1_class ?? 'Unknown',
                                        top1Conf: a.prediction?.top1_conf ?? 0,
                                    },
                                })),
                            };

                            const { result: newResult, detections: newDetections } =
                                shrimpHealthAIService.mapPredictResponse(healthResponse);

                            setResults(prev => [...prev, newResult]);
                            setDetections(newDetections);
                            setHasAnalyzedCurrent(true);

                            // Add entry to check history
                            if (imageUri) {
                                setCheckEntries(prev => [
                                    ...prev,
                                    {
                                        index: prev.length + 1,
                                        originalImageUri: imageUri,
                                        processedImageUri: localImageUri || undefined,
                                        result: newResult,
                                    },
                                ]);
                            }

                            Toast.show(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.SUCCESS);
                        } else if (data.status === 'Failed') {
                            setIsPolling(false);
                            Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                        } else {
                            pollForResult(requestId, attempt + 1);
                        }
                    },
                    onError: () => {
                        pollForResult(requestId, attempt + 1);
                    },
                });
            }, POLLING_INTERVAL_MS);
        },
        [getResult, imageUri]
    );

    // ── Handlers ─────────────────────────────────
    const handleImageSelect = (
        uri: string,
        _base64?: string,
        _file?: unknown,
        dimensions?: { width: number; height: number }
    ) => {
        _setImageUri(uri);
        setProcessedImageUri(null);
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

        if (!selectedZoneId) {
            Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
            return;
        }

        // Step 1: Upload image via inference predict endpoint
        predict(
            {
                Image: {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `health_${Date.now()}.jpg`,
                },
                ZoneId: selectedZoneId,
                ModuleId: 'module3',
                ClientTimestamp: new Date().toISOString(),
            },
            {
                onSuccess: predictResult => {
                    console.log('[AI Health] Predict result:', predictResult);
                    if (!predictResult.requestId) {
                        Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                        return;
                    }

                    // Step 2: Poll for result
                    setIsPolling(true);
                    pollForResult(predictResult.requestId);
                },
            }
        );
    };

    const handleReset = () => {
        setIsResetModalVisible(true);
    };

    const handleConfirmReset = () => {
        _setImageUri(null);
        setProcessedImageUri(null);
        setResults([]);
        setDetections([]);
        setHasAnalyzedCurrent(false);
        setIsResetModalVisible(false);
        setCheckEntries([]);
    };

    const handleShowDetails = () => {
        if (currentResult?.items && currentResult.items.length > 0) {
            setIsSheetVisible(true);
        } else {
            AppToast(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.NO_DATA);
        }
    };

    const handleSave = () => {
        allowNavigation();
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

            if (route.params?.onReturnData) {
                route.params.onReturnData(params.aiHealthCheckResult);
                navigation.goBack();
            } else {
                navigation.navigate({
                    name: 'ShrimpHealthScreen',
                    params,
                    merge: true,
                } as never);
            }
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.backgroundPrimary }}>
            <ShrimpHealthAIForm
                isLoading={isLoading}
                results={results}
                currentResult={currentResult}
                previousResult={previousResult}
                countTimes={countTimes}
                imageUri={displayImageUri}
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
                checkEntries={checkEntries}
                onViewCheckEntry={(entry: HealthCheckEntry) => {
                    if (entry.processedImageUri) {
                        setProcessedImageUri(entry.processedImageUri);
                    }
                    setSelectedEntry(entry);
                    setIsSheetVisible(true);
                }}
                selectedEntry={selectedEntry}
            />
            {UnsavedChangesModal}
        </View>
    );
};
