import React, { useState, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { useFeeding, useCreateFeedingRecord } from '@/features/farm/hooks/feed/useFeeding';
import { CreateFeedingRecordPayload } from '@/features/farm/types/feedingRecord.types';
type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedTheShrimp'>;

export const AddFeederScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const { pondId } = route.params || {}; // Assuming pondId is passed

    const [note, setNote] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [executionDate, setExecutionDate] = useState(new Date());
    const scrollViewRef = useRef<ScrollView>(null);

    // Danh sách vật tư cho màn Cho ăn
    const { materials } = useFeeding();

    // Mutation để gọi API
    const createMutation = useCreateFeedingRecord();

    const handleSaveInfo = () => {
        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pondId) return;

        // Construct create payload
        const payload: CreateFeedingRecordPayload = {
            feedingDetail: {
                notes: note,
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: m.quantity,
                })),
            },
        };

        createMutation.mutate(
            { pondId, payload },
            {
                onSuccess: () => {
                    navigation.goBack();
                },
            }
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderFarm type="simple" title="Cho ăn" onBack={() => navigation.goBack()} />

            <Loading isLoading={createMutation.isPending}>
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
                        {/* Add extra padding at bottom to ensure content isn't hidden behind footer if keybaord is open or just for scroll space */}
                        <View style={styles.spacer} />
                    </ScrollView>
                </View>
            </Loading>

            {/* Bottom Action Bar */}
            <ButtonBarFarm
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSaveInfo}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
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
    spacer: {
        height: 80,
    },
});
