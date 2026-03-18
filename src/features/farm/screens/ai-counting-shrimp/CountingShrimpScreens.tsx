import React, { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useDocumentUploadV2 } from '@/shared/hooks/useDocumentUpload';
import { useCountSeedstock } from '@/features/farm/hooks/useAI';
import { StorageType } from '@/shared/types/common.types';
import { CountingShrimpForm } from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpForm';
import { TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import type { DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';

export interface CountingResult {
    count: number;
    detections: DetectionDot[];
}

type Props = NativeStackScreenProps<AppStackParamList, 'CountingShrimp'>;

const CountingShrimpScreen: React.FC<Props> = ({ navigation, route }) => {
    const { mutate: uploadDoc, isPending: isUploading } = useDocumentUploadV2();
    const { mutate: countSeedstock, isPending: isCounting } = useCountSeedstock();

    const [lastCountingResult, setLastCountingResult] = useState<CountingResult | null>(null);
    const { pondId, zoneId } = route.params ?? {};

    const isLoading = isUploading || isCounting;

    const handleStartCounting = useCallback(
        (imageUri: string) => {
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

                        // 2. Call AI counting
                        countSeedstock(
                            { documentId },
                            {
                                onSuccess: aiResponse => {
                                    const detections: DetectionDot[] = (aiResponse.detections ?? [])
                                        .filter(d => d.center)
                                        .map((d, i) => ({
                                            id: d.id ?? i,
                                            center: { x: d.center.x, y: d.center.y },
                                        }));

                                    setLastCountingResult({
                                        count: aiResponse.totalCount ?? 0,
                                        detections,
                                    });
                                },
                            }
                        );
                    },
                }
            );
        },
        [uploadDoc, countSeedstock]
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
