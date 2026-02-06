import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
} from '@/features/farm/hooks/feed/useFeeding';
import { CreateFeedingRecordPayload } from '@/features/farm/types/feedingRecord.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditFeeder'>;

export const EditFeederScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    // TODO: Add jobId or similar to params to identify what to edit
    const { pondId, jobId } = route.params || {};

    const [note, setNote] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [executionDate, setExecutionDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Danh sách vật tư cho màn Cho ăn (dùng logic giống HandleProblem)
    const { materials } = useFeeding();
    const updateMutation = useUpdateFeedingRecord();
    const deleteMutation = useDeleteFeedingRecord();

    // Load existing data
    // Fetch detail data
    // Load existing data
    // Fetch detail data
    const { data: detailData, isLoading: isDetailLoading } = useFeedingRecordDetail(
        pondId || '',
        jobId || ''
    );

    const isLoading =
        updateMutation.isPending || deleteMutation.isPending || (isDetailLoading && !!jobId);

    // Load existing data
    useEffect(() => {
        if (detailData?.data) {
            const item = detailData.data;
            if (item.feedingDetail) {
                setNote(item.feedingDetail.notes || '');

                if (item.feedingDetail.materials) {
                    // Map API materials to SelectedMaterialItem
                    // We need to find the full material info from the 'materials' list
                    const mappedMaterials: SelectedMaterialItem[] = item.feedingDetail.materials
                        .map((apiMat: any) => {
                            const fullMaterial = materials.find(
                                m => m.id === apiMat.warehouseItemId
                            );
                            if (fullMaterial) {
                                return {
                                    material: fullMaterial,
                                    quantity: apiMat.quantity,
                                    unit: fullMaterial.unitName || '',
                                };
                            }
                            return null;
                        })
                        .filter(
                            (m: SelectedMaterialItem | null): m is SelectedMaterialItem =>
                                m !== null
                        );

                    setSelectedMaterials(mappedMaterials);
                }
            }
            // Parse createdAt string to Date object
            if (item.createdAt) {
                setExecutionDate(new Date(item.createdAt));
            }
        }
    }, [detailData, materials]);

    const handleSaveInfo = () => {
        if (pondId && jobId) {
            // Construct payload
            const payload: CreateFeedingRecordPayload = {
                feedingDetail: {
                    notes: note,
                    materials: selectedMaterials.map(m => ({
                        warehouseItemId: m.material.id, // Ensure we access material.id
                        quantity: m.quantity,
                    })),
                },
            };

            updateMutation.mutate(
                { pondId, id: jobId, payload },
                {
                    onSuccess: () => {
                        navigation.goBack();
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
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                        <SelectionNotesBox
                            notes={note}
                            onNotesChange={setNote}
                            scrollViewRef={scrollViewRef}
                        />
                        <View style={styles.spacer} />
                    </ScrollView>
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
