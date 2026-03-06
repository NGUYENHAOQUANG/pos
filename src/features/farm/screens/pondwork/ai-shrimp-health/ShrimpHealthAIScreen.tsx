import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { usePredictShrimpHealth } from '@/features/farm/hooks/useAI';
import { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';
import {
    HealthCheckItem,
    HealthCheckResult,
    shrimpHealthAIService,
    ShrimpHealthApiResponse,
} from '@/features/farm/services/shrimp-health-ai.service';
import { ShrimpHealthAIForm } from './ShrimpHealthAIForm';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
// type ScreenRouteProp = RouteProp<AppStackParamList, 'ShrimpHealthCheckAIScreen'>;

export const ShrimpHealthCheckAIScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const [results, setResults] = useState<HealthCheckResult[]>([]);
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

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

    const [detections, setDetections] = useState<HealthDetectionBox[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });

    const { mutate: predictHealth, isPending } = usePredictShrimpHealth();

    // Derived state for current/latest display
    const currentResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;

    const [isLoading, _setIsLoading] = useState(false);
    const countTimes = results.length;

    const isScreenLoading = isLoading || isPending;

    const handleImageSelect = (
        uri: string,
        base64?: string,
        _file?: any,
        dimensions?: { width: number; height: number }
    ) => {
        _setImageUri(uri);
        if (base64) {
            setImageBase64(base64);
        }
        if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
            setImageDimensions(dimensions);
        }
        setDetections([]);
    };

    const handleGetResult = async () => {
        if (!imageUri || !imageBase64) {
            AppToast(TOAST_MESSAGES_CONFIG.SHRIMP_HEALTH_AI.NO_IMAGE);
            return;
        }

        _setIsLoading(true);

        predictHealth(
            { image_base: imageBase64 },
            {
                onSuccess: (response: ShrimpHealthApiResponse) => {
                    const { result: newResult, detections: newDetections } =
                        shrimpHealthAIService.mapPredictResponse(response);

                    setResults(prev => [...prev, newResult]);
                    setDetections(newDetections);
                },
                onSettled: () => {
                    _setIsLoading(false);
                },
            }
        );
    };

    const handleReset = () => {
        setIsResetModalVisible(true);
    };

    const handleConfirmReset = () => {
        _setImageUri(null);
        setImageBase64(null);
        setResults([]);
        setDetections([]);
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
            const statusString = isHealthy ? 'Khỏe mạnh' : 'Nhiễm bệnh';

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
                isLoading={isScreenLoading}
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
                onImageRemove={() => {
                    _setImageUri(null);
                    setImageBase64(null);
                    setDetections([]);
                    setImageDimensions({ width: 1, height: 1 });
                }}
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
            />
        </View>
    );
};
