import React, { useCallback, useState, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useInferencePredict, useGetInferenceResult } from '@/features/farm/hooks/useAI';
import { CountingShrimpForm } from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpForm';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import { downloadAzureBlobImage } from '@/shared/utils/azureBlobUrl';
import type { DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';

export interface CountingResult {
    count: number;
    detections: DetectionDot[];
    processedImageUri?: string;
}

type Props = NativeStackScreenProps<AppStackParamList, 'CountingShrimp'>;

// Polling config
const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 30;

const CountingShrimpScreen: React.FC<Props> = ({ navigation, route }) => {
    const { mutate: predict, isPending: isPredicting } = useInferencePredict();
    const { mutate: getResult, isPending: isFetchingResult } = useGetInferenceResult();

    const [lastCountingResult, setLastCountingResult] = useState<CountingResult | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const { pondId, zoneId } = route.params ?? {};

    const isLoading = isPredicting || isFetchingResult || isPolling;

    // Keep track of zoneId for predict call
    const zoneIdRef = useRef(zoneId);
    zoneIdRef.current = zoneId;

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
                        console.log('[AI Counting] getResult status:', data.status);

                        if (data.status === 'Success' && data.imageProcessedUrl) {
                            setIsPolling(false);

                            // Download processed image
                            const localImageUri = await downloadAzureBlobImage(
                                data.imageProcessedUrl
                            );
                            console.log('[AI Counting] processedImageUri:', localImageUri);

                            // Parse annotations - counting may return various formats
                            let annotations: Array<{
                                id: number;
                                center: { x: number; y: number };
                            }> = [];
                            try {
                                const parsed = JSON.parse(data.annotationJson || '[]');
                                console.log(
                                    '[AI Counting] annotationJson parsed:',
                                    typeof parsed,
                                    parsed
                                );
                                // Handle different annotation formats:
                                // - Array directly: [...]
                                // - Object with array: { detections: [...] } or { results: [...] }
                                if (Array.isArray(parsed)) {
                                    annotations = parsed;
                                } else if (parsed && typeof parsed === 'object') {
                                    const possibleArray =
                                        parsed.detections ||
                                        parsed.results ||
                                        parsed.annotations ||
                                        parsed.data;
                                    if (Array.isArray(possibleArray)) {
                                        annotations = possibleArray;
                                    }
                                }
                            } catch (_e) {
                                console.warn('[AI Counting] Failed to parse annotationJson');
                                annotations = [];
                            }

                            const count =
                                annotations.length ||
                                (typeof JSON.parse(data.annotationJson || '{}') === 'object'
                                    ? JSON.parse(data.annotationJson || '{}').totalCount ??
                                      JSON.parse(data.annotationJson || '{}').count ??
                                      0
                                    : 0);

                            const detections: DetectionDot[] = annotations.map((a, i) => ({
                                id: a.id ?? i,
                                center: a.center ?? { x: 0, y: 0 },
                            }));

                            setLastCountingResult({
                                count: count || annotations.length,
                                detections,
                                processedImageUri: localImageUri || undefined,
                            });
                            Toast.show(TOAST_MESSAGES_CONFIG.AI_COUNTING.SUCCESS);
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
        [getResult]
    );

    const handleStartCounting = useCallback(
        (imageUri: string) => {
            const currentZoneId = zoneIdRef.current;
            if (!currentZoneId) {
                Toast.show(TOAST_MESSAGES_CONFIG.AI_COMMON.UPLOAD_FAILED);
                return;
            }

            // Step 1: Upload image via inference predict endpoint
            predict(
                {
                    Image: {
                        uri: imageUri,
                        type: 'image/jpeg',
                        name: `counting_${Date.now()}.jpg`,
                    },
                    ZoneId: currentZoneId,
                    ModuleId: 'module1',
                    ClientTimestamp: new Date().toISOString(),
                },
                {
                    onSuccess: predictResult => {
                        console.log('[AI Counting] Predict result:', predictResult);
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
        },
        [predict, pollForResult]
    );

    const handleSave = useCallback(
        (result: string) => {
            const aiCount = parseInt(result || '0', 10);
            navigation.navigate({
                name: 'CreateCycle',
                params: { pondId: pondId, zoneId: zoneId, aiCount },
                merge: true,
            });
        },
        [navigation, pondId, zoneId]
    );

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleImageChange = useCallback(() => {
        setLastCountingResult(null);
    }, []);

    return (
        <CountingShrimpForm
            isLoading={isLoading}
            lastCountingResult={lastCountingResult}
            onRequestStartCounting={handleStartCounting}
            onImageChange={handleImageChange}
            onSave={handleSave}
            onBack={handleBack}
        />
    );
};

export default CountingShrimpScreen;
