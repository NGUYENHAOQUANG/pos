import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { ShrimpInspectionForm } from './ShrimpInspectionForm';
import { ShrimpInspectionMeta, JobExecution } from '@/features/farm/types/farm.types';
import { AIHealthCheckResult } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import {
    useCreateShrimpHealthCheck,
    useUpdateShrimpHealthCheck,
    useDeleteShrimpHealthCheck,
    useShrimpHealthCheckDetail,
} from '@/features/farm/hooks/useShrimpHealthCheckData';
import { ShrimpInspectionFormValues } from '@/features/farm/schemas/shrimpInspectionSchema';
import { AppToast, TOAST_MESSAGES_CONFIG } from '@/features/farm/utils/toastMessages';
import {
    shrimpHealthService,
    ShrimpHealthFormState,
} from '@/features/farm/services/pond-work/shrimp-health.service';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { documentApi } from '@/features/material/api/documentApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'ShrimpHealthScreen'>;

export const ShrimpHealthScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, zoneId, shrimpHealthId, aiHealthCheckResult } = route.params || {};

    const isEditMode = !!shrimpHealthId;

    const { data: detailResponse, isLoading: isDetailLoading } = useShrimpHealthCheckDetail(
        pondId,
        shrimpHealthId || ''
    );

    const createMutation = useCreateShrimpHealthCheck();
    const updateMutation = useUpdateShrimpHealthCheck();
    const deleteMutation = useDeleteShrimpHealthCheck();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [foodAmount, setFoodAmount] = useState('');
    const [leftoverFood, setLeftoverFood] = useState('Hết');
    const [intestine, setIntestine] = useState('Đầy');
    const [intestineColor, setIntestineColor] = useState('Màu thức ăn');
    const [stoolColor, setStoolColor] = useState('Màu thức ăn');
    const [liver, setLiver] = useState('Bình thường');
    const [notes, setNotes] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);

    const [averageInfectionRate, setAverageInfectionRate] = useState<number>(0);
    const [isHealthy, setIsHealthy] = useState<boolean>(true);
    const [diagnosisDetails, setDiagnosisDetails] = useState<Array<{
        diseaseType: string;
        probabilityPercent: number;
    }> | null>(null);
    const [aiItems, setAiItems] = useState<any[]>([]);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [aiTotalCount, setAiTotalCount] = useState<number>(0);

    const [initialData, setInitialData] = useState<ShrimpHealthFormState | null>(null);
    const [meta, setMeta] = useState<ShrimpInspectionMeta>({});
    const [documentIds, setDocumentIds] = useState<string[]>([]);

    // Track loaded documentIds to avoid refetching image URLs when they haven't changed
    const loadedDocIdsRef = useRef<string>('');

    useEffect(() => {
        if (!isEditMode) {
            setInitialData(null);
            loadedDocIdsRef.current = '';
            return;
        }

        const detail = detailResponse?.data;
        if (!detail) return;

        const populateDetail = async () => {
            const initialFormState = shrimpHealthService.buildFormStateFromDetail(detail);

            setSelectedDate(initialFormState.date);
            setFoodAmount(initialFormState.foodAmount);
            setLeftoverFood(initialFormState.leftoverFood);
            setIntestine(initialFormState.intestine);
            setIntestineColor(initialFormState.intestineColor);
            setStoolColor(initialFormState.stoolColor);
            setLiver(initialFormState.liver);
            setNotes(initialFormState.notes);
            setAverageInfectionRate(initialFormState.averageInfectionRate);
            setIsHealthy(initialFormState.isHealthy);
            setDiagnosisDetails(initialFormState.diagnosisDetails);
            setAiItems(initialFormState.aiItems);

            // Resolve image URLs from documentIds (same pattern as useMeasureShrimpSizeForm)
            // Only refetch URLs when documentIds actually changed (prevents flicker from SAS token changes)
            const currentDocIds = detail.documentIds || detail.documents?.map(d => d.id) || [];
            const docIdsKey = JSON.stringify(currentDocIds);

            if (docIdsKey !== loadedDocIdsRef.current) {
                let resolvedImages: string[] = [];
                let resolvedDocIds: string[] = [];

                if (detail.documents && detail.documents.length > 0) {
                    resolvedImages = detail.documents
                        .map(doc => doc.publicUrl)
                        .filter(Boolean) as string[];
                    resolvedDocIds = detail.documents.map(doc => doc.id);
                } else if (detail.documentIds && detail.documentIds.length > 0) {
                    resolvedImages = await documentApi.getUrls(detail.documentIds);
                    resolvedDocIds = detail.documentIds;
                }

                loadedDocIdsRef.current = docIdsKey;
                setImageUris(resolvedImages);
                setDocumentIds(resolvedDocIds);
                setMeta({ documentIds: resolvedDocIds });

                // Set initialData AFTER images resolved to prevent false hasChanges
                setInitialData({ ...initialFormState, images: resolvedImages });
            } else {
                // DocIds unchanged, keep existing images but update other form data
                setInitialData((prev: ShrimpHealthFormState | null) =>
                    prev ? { ...initialFormState, images: prev.images } : initialFormState
                );
            }
        };

        populateDetail();
    }, [isEditMode, detailResponse]);

    useEffect(() => {
        if (aiHealthCheckResult) {
            const { totalCount, infectionRate, status, details } = aiHealthCheckResult;

            setAverageInfectionRate(infectionRate);
            setAiTotalCount(totalCount || 0);
            setIsHealthy(status === 'Khỏe mạnh' || Number(infectionRate) === 0);

            const { aiItems: parsedAiItems, diagnosisDetails: parsedDiagnosisDetails } =
                shrimpHealthService.parseAiDetails(details);

            setAiItems(parsedAiItems);
            setDiagnosisDetails(parsedDiagnosisDetails);

            navigation.setParams({ aiHealthCheckResult: undefined } as any);
        }
    }, [aiHealthCheckResult, navigation]);

    const displayAiResult: AIHealthCheckResult | null = useMemo(() => {
        const result = shrimpHealthService.buildDisplayResult({
            averageInfectionRate,
            isHealthy,
            diagnosisDetails,
            aiItems,
            aiTotalCount,
        });

        if (!result) return null;

        return {
            totalCount: result.totalCount,
            infectionRate: result.infectionRate,
            status: result.status,
            imageUri: null,
            items: result.items,
        };
    }, [averageInfectionRate, isHealthy, diagnosisDetails, aiItems, aiTotalCount]);

    const isSaving =
        isDetailLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    const isFormComplete = isEditMode ? true : foodAmount.trim().length > 0;

    const hasChanges = (() => {
        if (!isEditMode || !initialData) return true;

        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        if (foodAmount !== initialData.foodAmount) return true;
        if (leftoverFood !== initialData.leftoverFood) return true;
        if (intestine !== initialData.intestine) return true;
        if (intestineColor !== initialData.intestineColor) return true;
        if (stoolColor !== initialData.stoolColor) return true;
        if (liver !== initialData.liver) return true;
        if (notes !== initialData.notes) return true;
        if (averageInfectionRate !== initialData.averageInfectionRate) return true;
        if (isHealthy !== initialData.isHealthy) return true;
        if (diagnosisDetails !== initialData.diagnosisDetails) return true;

        if (imageUris.length !== initialData.images.length) return true;
        const imagesChanged = imageUris.some((uri, index) => uri !== initialData.images[index]);
        if (imagesChanged) return true;

        return false;
    })();

    const hasUnsavedChangesForWarning = (() => {
        if (!isEditMode) {
            return (
                foodAmount.length > 0 ||
                leftoverFood !== 'Hết' ||
                intestine !== 'Đầy' ||
                intestineColor !== 'Màu thức ăn' ||
                stoolColor !== 'Màu thức ăn' ||
                liver !== 'Bình thường' ||
                notes.length > 0 ||
                imageUris.length > 0 ||
                averageInfectionRate > 0 ||
                !isHealthy ||
                aiItems.length > 0
            );
        }
        return hasChanges;
    })();

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasUnsavedChangesForWarning);

    const isButtonDisabled = !isFormComplete || (isEditMode && !hasChanges);

    const handleSubmit = (documentIds: string[]) => {
        const formState: ShrimpHealthFormState = {
            date: selectedDate,
            foodAmount,
            leftoverFood,
            intestine,
            intestineColor,
            stoolColor,
            liver,
            notes,
            images: imageUris,
            averageInfectionRate,
            isHealthy,
            diagnosisDetails,
            aiItems,
        };

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
                        allowNavigation();
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
                        allowNavigation();
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
                    allowNavigation();
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
        });
    };

    return (
        <>
            <ShrimpInspectionForm
                itemToEdit={
                    isEditMode && shrimpHealthId
                        ? ({ id: shrimpHealthId } as JobExecution)
                        : undefined
                }
                meta={(meta || { documentIds }) as ShrimpInspectionMeta}
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                values={{
                    date: selectedDate,
                    foodAmount,
                    leftoverFood,
                    intestine,
                    intestineColor,
                    stoolColor,
                    liver,
                    notes,
                    images: imageUris,
                    averageInfectionRate,
                    isHealthy,
                    diagnosisDetails,
                    aiItems,
                }}
                onChange={(patch: Partial<ShrimpInspectionFormValues>) => {
                    if (patch.foodAmount !== undefined) setFoodAmount(patch.foodAmount);
                    if (patch.leftoverFood !== undefined) setLeftoverFood(patch.leftoverFood);
                    if (patch.intestine !== undefined) setIntestine(patch.intestine);
                    if (patch.intestineColor !== undefined) setIntestineColor(patch.intestineColor);
                    if (patch.stoolColor !== undefined) setStoolColor(patch.stoolColor);
                    if (patch.liver !== undefined) setLiver(patch.liver);
                    if (patch.notes !== undefined) setNotes(patch.notes);
                    if (patch.averageInfectionRate !== undefined)
                        setAverageInfectionRate(patch.averageInfectionRate);
                    if (patch.isHealthy !== undefined) setIsHealthy(patch.isHealthy);
                    if (patch.diagnosisDetails !== undefined)
                        setDiagnosisDetails(patch.diagnosisDetails);
                    if (patch.aiItems !== undefined) setAiItems(patch.aiItems);
                }}
                onImagesChange={setImageUris}
                aiResult={displayAiResult}
                isSaving={isSaving}
                isLoadingDetail={isDetailLoading && isEditMode}
                isDeleteModalVisible={isDeleteModalVisible}
                onBack={handleBack}
                onDeletePress={() => setIsDeleteModalVisible(true)}
                onConfirmDelete={handleDelete}
                onCancelDelete={() => setIsDeleteModalVisible(false)}
                onAICheckPress={handleAICheckPress}
                onSubmit={handleSubmit}
                primaryDisabled={!!isButtonDisabled}
            />
            {UnsavedChangesModal}
        </>
    );
};
