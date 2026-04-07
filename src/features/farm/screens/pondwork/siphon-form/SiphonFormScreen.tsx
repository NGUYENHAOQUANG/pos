import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import {
    useCreateSiphonRecord,
    useUpdateSiphonRecord,
    useDeleteSiphonRecord,
    useSiphonDetail,
} from '@/features/farm/hooks/useSiphonRecords';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { documentApi } from '@/features/material/api/documentApi';
import { SiphonFormValues } from '@/features/farm/schemas/siphonFormSchema';
import { siphonFormService } from '@/features/farm/services/pond-work/siphon.service';
import { SiphonFormContent } from '@/features/farm/screens/pondwork/siphon-form/SiphonFormContent';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'AddSiphonScreen'>;

export const AddSiphonScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, siphonId } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();

    const isEditing = !!siphonId;

    // ── Mutations ───────────────────────────────────────────────────
    const createMutation = useCreateSiphonRecord();
    const updateMutation = useUpdateSiphonRecord();
    const deleteMutation = useDeleteSiphonRecord();

    const isSavingActively =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // ── Data fetching ───────────────────────────────────────────────
    const { materials } = useFarmMaterials();
    const { data: detail, isLoading: isLoadingDetail } = useSiphonDetail(pond?.id, siphonId);

    // ── Map detail → form values ────────────────────────────────────
    const [imageUris, setImageUris] = useState<string[]>([]);

    useEffect(() => {
        if (!detail?.documentIds?.length) return;
        documentApi
            .getUrls(detail.documentIds)
            .then(setImageUris)
            .catch(() => {});
    }, [detail?.documentIds]);

    const initialValues: SiphonFormValues = useMemo(() => {
        if (!detail) return siphonFormService.createDefaultFormValues();
        const formValues = siphonFormService.mapDetailToForm(detail, materials);
        formValues.imageUris = imageUris;
        return formValues;
    }, [detail, materials, imageUris]);

    const initialSnapshot = useMemo(() => {
        if (!detail) return null;
        return siphonFormService.createSnapshot(initialValues);
    }, [detail, initialValues]);

    const selectedDate = useMemo(() => {
        if (detail?.createdAt) return new Date(detail.createdAt);
        return new Date();
    }, [detail?.createdAt]);

    const [date, setDate] = useState<Date>(selectedDate);

    useEffect(() => {
        setDate(selectedDate);
    }, [selectedDate]);

    // ── Hide tab bar ────────────────────────────────────────────────
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // ── Handlers passed to Content ──────────────────────────────────
    const handleSave = useCallback(
        async (payload: any) => {
            if (!pond?.id) {
                navigation.goBack();
                return;
            }

            if (isEditing && siphonId) {
                await updateMutation.mutateAsync({
                    pondId: pond.id,
                    id: siphonId,
                    data: payload,
                });
            } else {
                await createMutation.mutateAsync({
                    pondId: pond.id,
                    data: payload,
                });
            }
        },
        [pond?.id, isEditing, siphonId, createMutation, updateMutation, navigation]
    );

    const handleDelete = useCallback(async () => {
        if (!pond?.id || !siphonId) return;
        await deleteMutation.mutateAsync({ pondId: pond.id, id: siphonId });
    }, [pond?.id, siphonId, deleteMutation]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    // ── Render ──────────────────────────────────────────────────────
    return (
        <SiphonFormContent
            isEditing={isEditing}
            isLoadingDetail={isEditing && isLoadingDetail}
            isSaving={isSavingActively}
            initialValues={initialValues}
            initialSnapshot={initialSnapshot}
            selectedDate={date}
            onDateChange={setDate}
            onSave={handleSave}
            onDelete={handleDelete}
            onBack={handleBack}
        />
    );
};
