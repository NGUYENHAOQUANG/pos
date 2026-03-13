import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    AquacultureForm,
    AquacultureFormRef,
} from '@/features/menu/components/aquaculture/AquacultureForm';
import { Loading } from '@/shared/components/ui/Loading';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useZones } from '@/features/farm/hooks/useZones';
import { useSeasonDetail } from '@/features/menu/hooks/useSeasons';
import {
    useUpdateSeason,
    useDeleteSeason,
    useCloseSeason,
} from '@/features/menu/hooks/useAquacultureMutations';
import { aquacultureService } from '@/features/menu/services/aquacultureService';
import { AquacultureFormValues } from '@/features/menu/schemas/aquacultureFormSchema';
import { AppStackParamList } from '@/app/navigation/AppStack';

type EditAquacultureRouteProp = RouteProp<
    { EditAquaculture: { aquaculture: SeasonData } },
    'EditAquaculture'
>;

export const EditAquacultureScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<EditAquacultureRouteProp>();
    const { aquaculture: initialAquaculture } = route.params;
    const { setTabBarVisible } = useTabBarVisibility();
    const formRef = useRef<AquacultureFormRef>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [closeModalVisible, setCloseModalVisible] = useState(false);
    const [formHasChanges, setFormHasChanges] = useState(false);

    // ================================================================
    // Data Fetching (TanStack Query)
    // ================================================================
    const { data: zones = [] } = useZones();
    const { data: aquaculture, isLoading: isFetchingDetail } = useSeasonDetail(
        initialAquaculture.zoneId,
        initialAquaculture.id,
        initialAquaculture
    );

    // ================================================================
    // Mutations
    // ================================================================
    const updateSeasonMutation = useUpdateSeason();
    const deleteSeasonMutation = useDeleteSeason();
    const closeSeasonMutation = useCloseSeason();

    const isSubmitting =
        updateSeasonMutation.isPending ||
        deleteSeasonMutation.isPending ||
        closeSeasonMutation.isPending;

    // ================================================================
    // Mapped Data (useMemo to prevent unnecessary re-renders)
    // ================================================================
    const zoneOptions = useMemo(() => {
        return zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
    }, [zones]);

    const initialData = useMemo(() => {
        if (!aquaculture) return undefined;
        return aquacultureService.mapDetailToForm(aquaculture);
    }, [aquaculture]);

    // ================================================================
    // Tab bar visibility
    // ================================================================
    useFocusEffect(
        React.useCallback(() => {
            const timeout = setTimeout(() => {
                setTabBarVisible(false);
            }, 100);

            return () => {
                clearTimeout(timeout);
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    // ================================================================
    // Handlers
    // ================================================================
    const handleSubmit = useCallback(
        (formData: AquacultureFormValues) => {
            if (!aquaculture?.zoneId) return;

            updateSeasonMutation.mutate(
                {
                    zoneId: aquaculture.zoneId.toString(),
                    seasonId: aquaculture.id.toString(),
                    formData,
                },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        },
        [aquaculture, updateSeasonMutation, navigation]
    );

    const handleDelete = useCallback(() => {
        setDeleteModalVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!aquaculture?.zoneId) return;

        deleteSeasonMutation.mutate(
            {
                zoneId: aquaculture.zoneId.toString(),
                seasonId: aquaculture.id.toString(),
            },
            {
                onSuccess: () => {
                    setDeleteModalVisible(false);
                    navigation.goBack();
                },
                onSettled: () => {
                    setDeleteModalVisible(false);
                },
            }
        );
    }, [aquaculture, deleteSeasonMutation, navigation]);

    const handleCloseSeason = useCallback(() => {
        setCloseModalVisible(true);
    }, []);

    const handleConfirmClose = useCallback(() => {
        if (!aquaculture?.zoneId) return;

        closeSeasonMutation.mutate(
            {
                zoneId: aquaculture.zoneId.toString(),
                seasonId: aquaculture.id.toString(),
            },
            {
                onSuccess: () => {
                    setCloseModalVisible(false);
                    navigation.goBack();
                },
                onSettled: () => {
                    setCloseModalVisible(false);
                },
            }
        );
    }, [aquaculture, closeSeasonMutation, navigation]);

    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
    const handlePrimaryPress = useCallback(() => formRef.current?.submit(), []);
    const handleSecondaryPress = useCallback(() => {
        if (aquaculture?.status === SeasonStatus.Closed) {
            navigation.goBack();
        } else {
            handleCloseSeason();
        }
    }, [aquaculture?.status, navigation, handleCloseSeason]);
    const handleCancelDelete = useCallback(() => setDeleteModalVisible(false), []);
    const handleCancelClose = useCallback(() => setCloseModalVisible(false), []);

    return (
        <Loading isLoading={isSubmitting || isFetchingDetail}>
            <View style={styles.container}>
                <HeaderMenu
                    title="Chỉnh sửa vụ nuôi"
                    onBack={handleGoBack}
                    rightIcon={<DeleteIcon width={20} height={20} color={colors.text} />}
                    onRightPress={handleDelete}
                />

                {aquaculture && (
                    <View style={styles.content}>
                        <AquacultureForm
                            ref={formRef}
                            isEditMode={true}
                            isLoadingDetail={isFetchingDetail}
                            isSubmitting={isSubmitting}
                            initialData={initialData}
                            zoneOptions={zoneOptions}
                            onSubmit={handleSubmit}
                            onHasChangesChange={setFormHasChanges}
                        />
                    </View>
                )}

                {aquaculture && (
                    <ButtonBarMenu
                        primaryTitle="Cập nhật thông tin"
                        secondaryTitle={
                            aquaculture.status === SeasonStatus.Closed ? 'Huỷ' : 'Đóng vụ nuôi'
                        }
                        onPrimaryPress={handlePrimaryPress}
                        onSecondaryPress={handleSecondaryPress}
                        primaryDisabled={!formHasChanges}
                        secondaryType={
                            aquaculture.status === SeasonStatus.Closed ? 'default' : 'danger'
                        }
                    />
                )}

                <ConfirmationModalUI
                    visible={deleteModalVisible}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    title="Xoá vụ nuôi"
                    message="Bạn có chắc chắn muốn xoá vụ nuôi này?"
                    successMessage="Đã xóa vụ nuôi thành công"
                    showSuccessToast={false}
                />

                <ConfirmationModalUI
                    visible={closeModalVisible}
                    onConfirm={handleConfirmClose}
                    onCancel={handleCancelClose}
                    title="Đóng vụ nuôi"
                    message="Bạn có chắc chắn muốn đóng vụ nuôi này?"
                    confirmText="Đồng ý"
                    successMessage="Đã đóng vụ nuôi thành công"
                    showSuccessToast={false}
                />
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
});
