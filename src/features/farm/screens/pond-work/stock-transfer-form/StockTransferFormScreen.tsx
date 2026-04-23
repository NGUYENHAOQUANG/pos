import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCreateStockTransfer } from '@/features/farm/hooks/useStockTransfer';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useAllPondsByZone, usePondDetail } from '@/features/farm/hooks/usePonds';
import { usePondCategories } from '@/features/farm/hooks/usePondCategories';
import { useSizeMeasurements } from '@/features/farm/hooks/useSizeMeasurement';
import { useCurrentShrimpBreed } from '@/features/material/hooks/useShrimpSeeds';
import { stockTransferService } from '@/features/farm/services/pond-work/stock-transfer.service';
import { stockTransferFormSchema } from '@/features/farm/schemas/stockTransferFormSchema';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { StockTransferSkeleton } from '@/features/farm/components/skeleton/StockTransferSkeleton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import Toast from 'react-native-toast-message';
import { NormalizedError } from '@/core/api/errorHandler';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import {
    StockTransferForm,
    StockTransferFormData,
} from '@/features/farm/screens/pond-work/stock-transfer-form/StockTransferForm';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'StockTransferFormScreen'>;

export const StockTransferFormScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { mutateAsync: createStockTransfer, isPending: isCreating } = useCreateStockTransfer({
        suppressErrorToast: true,
    });
    const theme = useAppTheme();
    const [serverWarning, setServerWarning] = useState<string | undefined>();
    const [showMeasureModal, setShowMeasureModal] = useState(false);
    const [measureModalMessage, setMeasureModalMessage] = useState('');
    const styles = getStyles(theme);

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const zoneId = selectedZoneId ? String(selectedZoneId) : undefined;

    const { pondId, cycleId, warehouseId } = route.params || {};

    const { data: pondsByZoneData } = useAllPondsByZone(zoneId!, {
        CanStockTransfer: true,
    });
    const { data: categoriesResponse } = usePondCategories();
    const { data: sizeMeasurementsData, isLoading: isSizeMeasurementsLoading } =
        useSizeMeasurements(pondId);
    const { breedName, cycleData } = useCurrentShrimpBreed(pondId, cycleId, warehouseId);

    const { data: currentPondData } = usePondDetail(zoneId!, pondId!);

    // Resolve pond type name (from type.name or via pondCategoryId + categories)
    const currentPondTypeName = useMemo(() => {
        if (currentPondData?.type?.name) return currentPondData.type.name;
        if (currentPondData?.pondCategoryId && categoriesResponse?.items) {
            const cat = categoriesResponse.items.find(
                (c: any) => c.id === currentPondData.pondCategoryId
            );
            return cat?.name;
        }
        return undefined;
    }, [currentPondData, categoriesResponse]);

    const pondOptions = useMemo(
        () =>
            stockTransferService.getReceivingPondOptions(
                pondsByZoneData ?? [],
                pondId || '',
                categoriesResponse?.items,
                currentPondTypeName
            ),
        [pondsByZoneData, pondId, categoriesResponse, currentPondTypeName]
    );

    const actualStockingQuantity = cycleData?.totalStocking ?? 0;

    const sizeMeasurementDetail = useMemo(() => {
        const items = sizeMeasurementsData?.data?.items || [];
        if (items.length === 0) return undefined;
        return [...items].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        })[0];
    }, [sizeMeasurementsData]);

    const sizeDetail =
        sizeMeasurementDetail?.sizeMeasurementDetail || sizeMeasurementDetail?.sizeMeasurement;
    const latestShrimpSize = sizeDetail
        ? stockTransferService.getLatestShrimpSizeFromMeasurement(sizeDetail)
        : undefined;
    const totalEstimatedShrimp = sizeDetail?.totalShrimpCount ?? 0;

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
                totalEstimatedShrimp,
                shrimpSize,
                notes
            );

            try {
                await createStockTransfer({ pondId, data: apiRequestData, zoneId });
                navigation.goBack();
            } catch (error) {
                const normalizedError = error as NormalizedError;
                let msg = normalizedError.message || 'Có lỗi xảy ra';

                if (normalizedError.type === 'VALIDATION_ERROR' && normalizedError.fields) {
                    const firstFieldKey = Object.keys(normalizedError.fields)[0];
                    if (firstFieldKey && normalizedError.fields[firstFieldKey]?.length > 0) {
                        msg = normalizedError.fields[firstFieldKey][0];
                    }
                }
                const errorType = stockTransferService.classifyError(msg);

                switch (errorType) {
                    case 'modal':
                        setMeasureModalMessage(msg);
                        setShowMeasureModal(true);
                        break;
                    case 'warning':
                        setServerWarning(msg);
                        break;
                    case 'silent':
                        break;
                    case 'toast':
                    default:
                        Toast.show({ type: 'error', text1: msg, visibilityTime: 4000 });
                        break;
                }
            }
        },
        [pondId, zoneId, totalEstimatedShrimp, createStockTransfer, navigation]
    );

    if (isSizeMeasurementsLoading) {
        return (
            <View style={styles.container}>
                <HeaderSection title="Sang ao" onBack={handleBack} />
                <StockTransferSkeleton />
            </View>
        );
    }

    return (
        <>
            <StockTransferForm
                totalShrimpCount={totalEstimatedShrimp}
                shrimpBreed={breedName}
                actualStockingQuantity={actualStockingQuantity}
                latestShrimpSize={latestShrimpSize}
                pondOptions={pondOptions}
                isSubmitting={isCreating}
                serverWarningMessage={serverWarning}
                onBack={handleBack}
                onSubmit={handleSubmit}
                currentPondName={currentPondData?.name}
                cultureDays={pondDetailService.calculateDOC(cycleData?.createdAt)}
            />
            <ConfirmationModalUI
                visible={showMeasureModal}
                title="Xác nhận sang ao"
                message={measureModalMessage}
                confirmText="Đo ngay"
                cancelText="Hủy"
                showSuccessToast={false}
                onConfirm={() => {
                    setShowMeasureModal(false);
                    navigation.replace('MeasureShrimpSizeScreen', { pondId });
                }}
                onCancel={() => setShowMeasureModal(false)}
            />
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
    });
