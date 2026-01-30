import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox, GeneralInfoBoxRef } from '../../components/pondwork/GeneralInfoBox';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { useHandleProblemForm } from '@/features/farm/hooks/handleProblem/useHandleProblemForm';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblem'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();

    const { pond, item, jobType = 'CLEAN_POND' } = route.params || {};

    const {
        selectedDate,
        setSelectedDate,
        selectedMaterials,
        setSelectedMaterials,
        note,
        setNote,
        imageUris,
        setImageUris,
        showDeleteModal,
        handleSave,
        handleDelete,
        confirmDelete,
        cancelDelete,
        getTitle,
        materials,
        initialDocumentIds,
    } = useHandleProblemForm({
        pond,
        item,
        jobType,
        onSaveSuccess: () => {
            generalInfoBoxRef.current?.markAsSaved();
        },
    });

    const baseTitle = getTitle();
    const screenTitle = item ? `Chỉnh sửa ${baseTitle}` : baseTitle;

    const [showDatePicker, setShowDatePicker] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const handleSavePress = () => {
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        handleSave(documentIds);
    };

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="simple"
                title={screenTitle}
                onBack={() => navigation.goBack()}
                rightAction={
                    item ? (
                        <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
                            <DeleteIcon width={20} height={20} color={colors.red[900]} />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <SafeInputLayout>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* 1. Thông tin chung */}
                    <GeneralInfoBox
                        ref={generalInfoBoxRef}
                        type="withImage"
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                        imageUris={imageUris}
                        onImagesChange={setImageUris}
                        disabledDate={true}
                        documentIds={initialDocumentIds}
                    />
                    {/* 2. Chọn vật tư */}
                    <MaterialSelectionBox
                        selectedMaterials={selectedMaterials}
                        onMaterialsChange={setSelectedMaterials}
                        materials={materials}
                    />

                    {/* 3. Ghi chú (Mô tả sự cố) */}
                    <SelectionNotesBox
                        notes={note}
                        onNotesChange={setNote}
                        scrollViewRef={scrollViewRef}
                    />

                    <View style={styles.spacer} />
                </ScrollView>
            </SafeInputLayout>

            <ButtonBarFarm
                primaryTitle={item ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSavePress}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                date={selectedDate}
                onSelectDate={d => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(d.getFullYear());
                    newDate.setMonth(d.getMonth());
                    newDate.setDate(d.getDate());
                    setSelectedDate(newDate);
                }}
            />
            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    scrollContent: { paddingBottom: 100 },

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
    spacer: { height: 80 },
});
