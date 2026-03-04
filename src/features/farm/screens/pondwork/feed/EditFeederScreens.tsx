import React, { useState, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { Loading } from '@/shared/components/ui/Loading';

import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import {
    useFeeding,
    useUpdateFeedingRecord,
    useDeleteFeedingRecord,
    useFeedingRecordDetail,
} from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { CreateFeedingRecordPayload } from '@/features/farm/types/feedingRecord.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditFeeder'>;

export const EditFeederScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    // TODO: Add jobId or similar to params to identify what to edit
    const { pondId, jobId, itemToEdit } = route.params || {};

    const [note, setNote] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [executionDate, setExecutionDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Danh sách vật tư cho màn Cho ăn (dùng logic giống HandleProblem)
    const { materials } = useFeeding();
    const updateMutation = useUpdateFeedingRecord();
    const deleteMutation = useDeleteFeedingRecord();

    // Load existing data
    // Fetch detail data
    const { data: detailData, isLoading: isDetailLoading } = useFeedingRecordDetail(
        pondId || '',
        jobId || ''
    );

    const isLoading =
        updateMutation.isPending || deleteMutation.isPending || (isDetailLoading && !!jobId);

    // Helper to map materials
    const mapMaterials = useCallback(
        (rawMaterials: any[]): SelectedMaterialItem[] => {
            return rawMaterials
                .map((apiMat: any) => {
                    // apiMat can be from API detail (warehouseItemId) or from WorkLog meta (id or warehouseItemId? check usePondRecords)
                    // In usePondRecords, Feeding meta has 'materials' array.
                    // Let's assume meta material structure matches what we need or has enough info.
                    // Checking usePondRecords: ref.materials is { id, name, quantity, unit, warehouseItemId } usually?
                    // Actually usePondRecords just says "ref.materials".
                    // Let's map safely finding by ID if possible.

                    // If coming from meta, it might have warehouseItemId or just id.
                    const matId = apiMat.warehouseItemId || apiMat.id;
                    const fullMaterial = materials.find(m => m.id === matId);

                    if (fullMaterial) {
                        return {
                            material: fullMaterial,
                            quantity: apiMat.quantity,
                            unit: fullMaterial.unitName || '',
                        };
                    }
                    return null;
                })
                .filter((m): m is SelectedMaterialItem => m !== null);
        },
        [materials]
    );

    // Load initial data from itemToEdit (fast)
    useEffect(() => {
        if (itemToEdit?.meta) {
            const meta = itemToEdit.meta as any;
            if (meta.notes) setNote(meta.notes);
            if (meta.materials) {
                const mapped = mapMaterials(meta.materials);
                if (mapped.length > 0) setSelectedMaterials(mapped);
            }
            if (itemToEdit.createdAt) {
                setExecutionDate(new Date(itemToEdit.createdAt));
            } else if (itemToEdit.date) {
                // Fallback if createdAt missing but date string exists
                // itemToEdit.date is "DD/MM/YYYY" usually? or ISO?
                // JobExecution date is usually "DD/MM/YYYY". time is "HH:mm".
                // Let's rely on createdAt first.
            }
        }
    }, [itemToEdit, materials, mapMaterials]);

    // Update data when detail API returns (authoritative)
    useEffect(() => {
        if (detailData?.data) {
            const item = detailData.data;
            if (item.feedingDetail) {
                setNote(item.feedingDetail.notes || '');

                if (item.feedingDetail.materials) {
                    const mapped = mapMaterials(item.feedingDetail.materials);
                    setSelectedMaterials(mapped);
                }
            }
            // Parse createdAt string to Date object
            if (item.createdAt) {
                setExecutionDate(new Date(item.createdAt));
            }
        }
    }, [detailData, materials, mapMaterials]);

    const handleSaveInfo = () => {
        if (pondId && jobId) {
            // Construct payload
            const payload: CreateFeedingRecordPayload = {
                feedingDetail: {
                    notes: note,
                    materials: selectedMaterials.map(m => ({
                        warehouseItemId: m.material.id, // Ensure we access material.id
                        quantity: Number.isNaN(Number(m.quantity))
                            ? m.quantity
                            : Number(m.quantity),
                    })),
                },
            };

            updateMutation.mutate(
                { pondId, id: jobId, payload },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                    onError: (error: any) => {
                        let message = getErrorMessage(error, 'Vui lòng thử lại');
                        if (
                            message.includes('invalid start of a value') ||
                            message.includes('converted to System.Decimal') ||
                            message.includes('System.Decimal')
                        ) {
                            message = 'Số lượng vật tư không hợp lệ';
                        }
                        Toast.show({
                            type: 'error',
                            text1: 'Lưu thất bại',
                            text2: message,
                            position: 'top',
                        });
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setShowDeleteModal(false);
        if (pondId && jobId) {
            deleteMutation.mutate(
                { pondId, id: jobId },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        }
    };

    const renderHeaderRight = () => (
        <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
            <DeleteIcon width={20} height={20} color={colors.red[900]} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderFarm
                type="simple"
                title="Cho ăn"
                onBack={() => navigation.goBack()}
                rightAction={renderHeaderRight()}
            />

            <Loading isLoading={isLoading}>
                <View style={styles.contentContainer}>
                    <SafeInputLayout contentContainerStyle={styles.scrollContent}>
                        {/* General Info Section */}
                        <GeneralInfoBox
                            date={executionDate}
                            onDateChange={setExecutionDate}
                            disabledDate={true}
                        />

                        {/* Select Material Section */}
                        <MaterialSelectionBox
                            selectedMaterials={selectedMaterials}
                            onMaterialsChange={setSelectedMaterials}
                            materials={materials}
                        />

                        {/* Note Section */}
                        <SelectionNotesBox notes={note} onNotesChange={setNote} />
                        <View style={styles.spacer} />
                    </SafeInputLayout>
                </View>
            </Loading>

            {/* Footer */}
            <ButtonBarFarm
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSaveInfo}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            {/* Modals */}
            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.md,
    },
    headerDeleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.red[900],
        backgroundColor: colors.white,
    },
    spacer: {
        height: 80,
    },
});
