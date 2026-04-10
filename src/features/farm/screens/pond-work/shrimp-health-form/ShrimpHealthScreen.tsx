import React, { useEffect, useMemo, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { ShrimpHealthForm } from './ShrimpHealthForm';
import { AIHealthCheckResult } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { useAppTheme } from '@/styles/themeContext';
import { View } from 'react-native';
import {
    useCreateShrimpHealthCheck,
    useUpdateShrimpHealthCheck,
    useDeleteShrimpHealthCheck,
    useShrimpHealthCheckDetail,
} from '@/features/farm/hooks/useShrimpHealthCheckData';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import {
    shrimpHealthService,
    ShrimpHealthFormState,
} from '@/features/farm/services/pond-work/shrimp-health.service';
import { useDocumentUrls } from '@/shared/hooks/useDocumentUrls';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'ShrimpHealthScreen'>;

export const ShrimpHealthScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId, shrimpHealthId } = route.params || {};

    const isEditMode = !!shrimpHealthId;

    const { data: detailResponse, isLoading: isDetailLoading } = useShrimpHealthCheckDetail(
        pondId,
        shrimpHealthId || ''
    );

    const createMutation = useCreateShrimpHealthCheck();
    const updateMutation = useUpdateShrimpHealthCheck();
    const deleteMutation = useDeleteShrimpHealthCheck();

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const [aiHealthCheckResultProxy, setAiHealthCheckResultProxy] =
        useState<AIHealthCheckResult | null>(null);

    const [initialData, setInitialData] = useState<ShrimpHealthFormState | null>(null);
    const [documentIds, setDocumentIds] = useState<string[]>([]);
    const currentDocIds = useMemo(() => {
        if (!isEditMode || !detailResponse?.data) return [];
        return (
            detailResponse.data.documentIds || detailResponse.data.documents?.map(d => d.id) || []
        );
    }, [isEditMode, detailResponse?.data]);

    const { imageUris } = useDocumentUrls(currentDocIds);

    useEffect(() => {
        if (!isEditMode) {
            setInitialData(shrimpHealthService.createDefaultFormValues());
            return;
        }

        const detail = detailResponse?.data;
        if (!detail) return;

        const initialFormState = shrimpHealthService.buildFormStateFromDetail(detail);

        let resolvedImages: string[] = imageUris;

        // If imageUris are not fetched yet but we have publicUrls natively, use them immediately
        if (resolvedImages.length === 0 && detail.documents && detail.documents.length > 0) {
            resolvedImages = detail.documents.map(doc => doc.publicUrl).filter(Boolean) as string[];
        }

        setInitialData({ ...initialFormState, images: resolvedImages });
        setDocumentIds(currentDocIds);

        if (initialFormState.aiItems && initialFormState.aiItems.length > 0) {
            setAiHealthCheckResultProxy({
                totalCount: initialFormState.aiItems.length,
                infectionRate: initialFormState.averageInfectionRate,
                status: initialFormState.isHealthy ? 'Khỏe mạnh' : 'Có bệnh',
                items: initialFormState.aiItems,
            });
        }
    }, [isEditMode, detailResponse, imageUris, currentDocIds]);

    // Removed old useEffect watching aiHealthCheckResult from route params

    const isSaving =
        isDetailLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    const handleSubmit = (
        formState: ShrimpHealthFormState,
        documentIds: string[],
        markUploadsAsSaved: () => void
    ) => {
        const payload = shrimpHealthService.mapFormToPayload({
            state: formState,
            documentIds,
        });

        if (isEditMode && shrimpHealthId) {
            updateMutation.mutate(
                {
                    pondId,
                    id: shrimpHealthId,
                    payload,
                },
                {
                    onSuccess: () => {
                        markUploadsAsSaved();
                        AppToast({
                            type: 'success',
                            text1: TOAST_MESSAGES_CONFIG.JOB.SHRIMP_INSPECTION?.edit || '',
                        });
                        navigation.goBack();
                    },
                }
            );
        } else {
            createMutation.mutate(
                {
                    pondId,
                    payload,
                },
                {
                    onSuccess: () => {
                        markUploadsAsSaved();
                        AppToast({
                            type: 'success',
                            text1: TOAST_MESSAGES_CONFIG.JOB.SHRIMP_INSPECTION?.add || '',
                        });
                        navigation.goBack();
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        if (!pondId || !shrimpHealthId) return;

        deleteMutation.mutate(
            { pondId, id: shrimpHealthId },
            {
                onSuccess: () => {
                    setIsDeleteModalVisible(false);
                    AppToast({
                        type: 'success',
                        text1: TOAST_MESSAGES_CONFIG.JOB.SHRIMP_INSPECTION?.delete || '',
                    });
                    setTimeout(() => navigation.goBack(), 300);
                },
            }
        );
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleAICheckPress = () => {
        if (!pondId || !zoneId) return;
        navigation.navigate('ShrimpHealthCheckAIScreen', {
            pondId,
            zoneId,
            onReturnData: (aiResult: any) => {
                const { totalCount, infectionRate, status, details } = aiResult;

                const { aiItems: parsedAiItems, diagnosisDetails: parsedDiagnosisDetails } =
                    shrimpHealthService.parseAiDetails(details);

                const displayAiResult: AIHealthCheckResult = {
                    totalCount: totalCount || 0,
                    infectionRate,
                    status:
                        status === 'Khỏe mạnh' || Number(infectionRate) === 0
                            ? 'Khỏe mạnh'
                            : status,
                    items: parsedAiItems,
                };

                setAiHealthCheckResultProxy(displayAiResult);

                setInitialData((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        averageInfectionRate: infectionRate,
                        isHealthy: displayAiResult.status === 'Khỏe mạnh',
                        aiItems: parsedAiItems,
                        diagnosisDetails: parsedDiagnosisDetails,
                    };
                });
            },
        } as never);
    };

    const theme = useAppTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.backgroundPrimary }}>
            {initialData && (
                <ShrimpHealthForm
                    isEditMode={isEditMode}
                    initialData={initialData}
                    documentIds={documentIds}
                    aiResult={aiHealthCheckResultProxy}
                    isSaving={isSaving}
                    isLoadingDetail={isDetailLoading && isEditMode}
                    isDeleteModalVisible={isDeleteModalVisible}
                    onBack={handleBack}
                    onDeletePress={() => setIsDeleteModalVisible(true)}
                    onConfirmDelete={handleDelete}
                    onCancelDelete={() => setIsDeleteModalVisible(false)}
                    onAICheckPress={handleAICheckPress}
                    onSubmit={handleSubmit}
                />
            )}
        </View>
    );
};
