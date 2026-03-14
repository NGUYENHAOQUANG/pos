import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCreateStockTransfer } from '@/features/farm/hooks/useStockTransfer';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useAllPondsByZone } from '@/features/farm/hooks/usePonds';
import { usePondCategories } from '@/features/farm/hooks/usePondCategories';
import { useSizeMeasurements } from '@/features/farm/hooks/useSizeMeasurement';
import { useCurrentShrimpBreed } from '@/features/material/hooks/useShrimpSeeds';
import { stockTransferService } from '@/features/farm/services/stock-transfer.service';
import { stockTransferFormSchema } from '@/features/farm/schemas/stockTransferFormSchema';
import Toast from 'react-native-toast-message';
import {
    StockTransferForm,
    StockTransferFormData,
} from '@/features/farm/screens/pondwork/stock-transfer/StockTransferForm';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'StockTransferFormScreen'>;

export const StockTransferFormScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { mutateAsync: createStockTransfer, isPending: isCreating } = useCreateStockTransfer();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const zoneId = selectedZoneId ? String(selectedZoneId) : undefined;

    const { pondId, cycleId, warehouseId } = route.params || {};

    const { data: pondsByZoneData } = useAllPondsByZone(zoneId!);
    const { data: categoriesResponse } = usePondCategories();
    const { data: sizeMeasurementsData } = useSizeMeasurements(pondId, {
        PageSize: 1,
        OrderBy: 'CreatedAt desc',
    });
    const { breedName, cycleData } = useCurrentShrimpBreed(pondId, cycleId, warehouseId);

    const pondOptions = useMemo(
        () =>
            stockTransferService.getReceivingPondOptions(
                pondsByZoneData ?? [],
                pondId || '',
                categoriesResponse?.items
            ),
        [pondsByZoneData, pondId, categoriesResponse]
    );

    const actualStockingQuantity = cycleData?.totalStocking ?? 0;

    const latestShrimpSize = useMemo(() => {
        const latest = sizeMeasurementsData?.data?.items?.[0];
        if (!latest) return undefined;
        const detail = latest.sizeMeasurementDetail || latest.sizeMeasurement;
        return stockTransferService.getLatestShrimpSizeFromMeasurement(detail);
    }, [sizeMeasurementsData]);

    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    const handleSubmit = useCallback(
        async (formData: StockTransferFormData) => {
            const result = stockTransferFormSchema.safeParse(formData);
            if (!result.success) {
                Toast.show({
                    type: 'error',
                    text1: result.error.errors[0]?.message || 'Dữ liệu không hợp lệ',
                    visibilityTime: 3000,
                });
                return;
            }

            if (!pondId) {
                navigation.goBack();
                return;
            }

            const { shrimpSize, notes, receivingPonds } = formData;
            const apiRequestData = stockTransferService.buildCreateRequest(
                receivingPonds,
                actualStockingQuantity,
                shrimpSize,
                notes
            );

            await createStockTransfer({ pondId, data: apiRequestData, zoneId });
            navigation.goBack();
        },
        [pondId, zoneId, actualStockingQuantity, createStockTransfer, navigation]
    );

    return (
        <StockTransferForm
            shrimpBreed={breedName}
            actualStockingQuantity={actualStockingQuantity}
            latestShrimpSize={latestShrimpSize}
            pondOptions={pondOptions}
            isSubmitting={isCreating}
            onBack={handleBack}
            onSubmit={handleSubmit}
        />
    );
};
