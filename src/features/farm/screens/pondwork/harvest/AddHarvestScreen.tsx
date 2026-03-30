import React, { useEffect, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { HarvestMeta } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { parseDate } from '@/features/farm/utils/dateUtils';
import {
    getHarvestSuccessMessage,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import {
    useCreateHarvestRecord,
    useUpdateHarvestRecord,
    useDeleteHarvestRecord,
} from '@/features/farm/hooks/useHarvestRecord';
import { harvestService } from '@/features/farm/services/harvest.service';
import { HarvestFormData, getHarvestTypeDisplay } from '@/features/farm/schemas/harvestFormSchema';

import { AddHarvestForm } from './AddHarvestForm';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddHarvestScreen'>;

export const AddHarvestScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();

    const createHarvestMutation = useCreateHarvestRecord();
    const updateHarvestMutation = useUpdateHarvestRecord();
    const deleteHarvestMutation = useDeleteHarvestRecord();

    const isEditMode = !!itemToEdit;
    const isSubmitting =
        createHarvestMutation.isPending ||
        updateHarvestMutation.isPending ||
        deleteHarvestMutation.isPending;

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const initialData = useMemo(() => {
        const meta = (itemToEdit?.meta as HarvestMeta) || {};
        return harvestService.mapDetailToForm(meta, itemToEdit);
    }, [itemToEdit]);

    const initialDate = useMemo(() => {
        if (!itemToEdit?.date) return new Date();
        const date = parseDate(itemToEdit.date);
        if (itemToEdit.time) {
            const [hours, minutes] = itemToEdit.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                date.setHours(hours, minutes);
            }
        }
        return date;
    }, [itemToEdit]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDelete = async () => {
        if (!pond?.id || !itemToEdit?.id) return;

        await deleteHarvestMutation.mutateAsync({
            pondId: pond.id,
            id: itemToEdit.id,
        });

        setTimeout(() => navigation.goBack(), 300);
    };

    const handleSubmitData = async (data: HarvestFormData) => {
        if (!pond?.id) return;

        const apiRequest = harvestService.mapFormToPayload(data);

        try {
            if (isEditMode && itemToEdit?.id) {
                await updateHarvestMutation.mutateAsync({
                    pondId: pond.id,
                    id: itemToEdit.id,
                    data: apiRequest,
                });
                showEditJobSuccessToast('HARVEST' as JobType);
            } else {
                await createHarvestMutation.mutateAsync({
                    pondId: pond.id,
                    data: apiRequest,
                });

                Toast.show({
                    type: 'success',
                    text1: getHarvestSuccessMessage(getHarvestTypeDisplay(data.harvestType)),
                    visibilityTime: 5000,
                });
            }
            navigation.goBack();
        } catch (_error) {
            // Error handling is typically done in the mutation hook via handleError
        }
    };

    return (
        <AddHarvestForm
            initialData={initialData}
            initialDate={initialDate}
            isEditMode={isEditMode}
            isSubmitting={isSubmitting}
            onSubmitForm={handleSubmitData}
            onDelete={itemToEdit ? handleDelete : undefined}
            onBack={handleBack}
            onCancel={handleCancel}
        />
    );
};
