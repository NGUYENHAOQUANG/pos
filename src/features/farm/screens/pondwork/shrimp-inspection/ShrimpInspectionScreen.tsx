import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionFoodCheckBox';
import { ShrimpInspectionObservationBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { useShrimpHealthCheckForm } from '@/features/farm/hooks/shrimpHealthCheck/useShrimpHealthCheckForm';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'ShrimpInspectionScreen'>;

export const ShrimpInspectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit, aiHealthCheckResult } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);
    const meta = useMemo(
        () => (itemToEdit?.meta as ShrimpInspectionMeta) || ({} as ShrimpInspectionMeta),
        [itemToEdit?.meta]
    );
    const {
        selectedDate,
        setSelectedDate,
        foodAmount,
        setFoodAmount,
        leftoverFood,
        setLeftoverFood,
        intestine,
        setIntestine,
        intestineColor,
        setIntestineColor,
        stoolColor,
        setStoolColor,
        liver,
        setLiver,
        notes,
        setNotes,
        imageUris,
        setImageUris,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
        isSaving,
        isButtonDisabled,
    } = useShrimpHealthCheckForm({
        pondId: pond?.id,
        itemToEdit,
        meta,
    });

    // Handle AI Result
    useEffect(() => {
        if (aiHealthCheckResult) {
            const { totalCount, infectionRate, status, imageUri } = aiHealthCheckResult;

            const aiNote = `[Kết quả AI]\n- Số lượng mẫu: ${totalCount}\n- Tỉ lệ nhiễm bệnh: ${infectionRate}%\n- Tình trạng: ${status}`;

            setNotes(prev => (prev ? `${prev}\n\n${aiNote}` : aiNote));

            if (imageUri) {
                setImageUris(prev => [...prev, imageUri]);
            }

            navigation.setParams({ aiHealthCheckResult: undefined });
        }
    }, [aiHealthCheckResult, setNotes, setImageUris, navigation]);

    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleAICheckPress = () => {
        navigation.navigate('ShrimpHealthCheckAIScreen', { pond });
    };

    const handleSavePress = () => {
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        handleSave(documentIds, () => {
            generalInfoBoxRef.current?.markAsSaved();
            if (itemToEdit) {
                showEditJobSuccessToast('SHRIMP_INSPECTION');
            } else {
                showAddJobSuccessToast('SHRIMP_INSPECTION');
            }
        });
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        handleDelete();
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
    };

    // Check if form is filled completely (foodAmount is required only when creating new)
    return (
        <Loading isLoading={isSaving}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kiểm tra tôm</Text>
                    {itemToEdit ? (
                        <DeleteButton onPress={handleDeletePress} />
                    ) : (
                        <View style={styles.headerSpacer} />
                    )}
                </View>

                {/* Content */}
                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Thông tin chung Box */}
                        <GeneralInfoBox
                            ref={generalInfoBoxRef}
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            type="withImage"
                            imageUris={imageUris}
                            onImagesChange={setImageUris}
                            documentIds={meta.documentIds}
                            disabledDate={true}
                        />

                        {/* Kiểm tra thức ăn Box */}
                        <ShrimpInspectionFoodCheckBox
                            foodAmount={foodAmount}
                            onFoodAmountChange={setFoodAmount}
                            leftoverFood={leftoverFood}
                            onLeftoverFoodChange={setLeftoverFood}
                        />

                        {/* Quan sát mẫu Box */}
                        <ShrimpInspectionObservationBox
                            intestine={intestine}
                            onIntestineChange={setIntestine}
                            intestineColor={intestineColor}
                            onIntestineColorChange={setIntestineColor}
                            stoolColor={stoolColor}
                            onStoolColorChange={setStoolColor}
                            liver={liver}
                            onLiverChange={setLiver}
                            onAICheckPress={handleAICheckPress}
                        />

                        {/* Ghi chú Box */}
                        <SelectionNotesBox
                            notes={notes}
                            onNotesChange={setNotes}
                            scrollViewRef={scrollViewRef}
                        />
                    </ScrollView>
                </SafeInputLayout>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <ButtonBarFarm
                        primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                        secondaryTitle="Huỷ"
                        onPrimaryPress={handleSavePress}
                        onSecondaryPress={handleCancel}
                        primaryDisabled={itemToEdit ? isButtonDisabled : false}
                    />
                </View>

                {/* Delete Confirmation Modal */}
                <ConfirmationDeleteModal
                    visible={isDeleteModalVisible}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    successMessage="Đã xoá kiểm tra tôm"
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 0,
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
