import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { useFarm } from '@/features/farm/context/FarmContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { formatDate } from '@/features/farm/utils/dateUtils';

// Mock data (replace with real data or API later)
const MOCK_MATERIALS: IMaterial[] = [
    { id: '1', name: 'Thức ăn tôm thẻ', group: 'Nuôi', unit: 'kg', remaining: 100 },
    { id: '2', name: 'Khoáng tạt', group: 'Nuôi', unit: 'kg', remaining: 50 },
    { id: '3', name: 'Vôi nóng', group: 'Nuôi', unit: 'kg', remaining: 200 },
    { id: '4', name: 'Khoáng tạc', group: 'Nuôi', unit: 'kg', remaining: 0 },
];

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedTheShrimp'>;

export const AddFeederScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const { pondId } = route.params || {}; // Assuming pondId is passed
    const { updatePondJob, getPondJobItems } = useFarm();

    const [note, setNote] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [executionDate, setExecutionDate] = useState(new Date());

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

        if (pondId) {
            const currentItems = getPondJobItems(pondId, 'FEED');

            // Calculate next index based on max existing label to avoid duplicates
            let maxIndex = 0;
            currentItems.forEach(item => {
                const match = item.label.match(/Lần (\d+)/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    if (index > maxIndex) maxIndex = index;
                }
            });
            const nextIndex = maxIndex + 1;

            // Use executionDate instead of now
            // Format time as HH:mm to match existing job items style
            const timeString = executionDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });
            // Format date as DD/MM/YYYY for grouping using formatDate utility
            const dateString = formatDate(executionDate);

            const newItem = {
                id: Date.now().toString(),
                label: `Lần ${nextIndex}`,
                time: timeString,
                date: dateString,
                pondId: pondId,
                note: note || undefined,
                materials: selectedMaterials,
            };

            // Save to context
            updatePondJob(pondId, 'FEED', [...currentItems, newItem]);
        }

        // Logic to save all data
        console.log('Saving feeding info:', {
            time: new Date(),
            materials: selectedMaterials,
            note: note,
        });

        Toast.show({
            type: 'success',
            text1: 'Đã cho ăn thành công',
            position: 'top',
            visibilityTime: 3000,
        });

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderFarm type="simple" title="Cho ăn" onBack={() => navigation.goBack()} />

            <View style={styles.contentContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
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
                        materials={MOCK_MATERIALS}
                    />

                    {/* Note Section */}
                    <SelectionNotesBox notes={note} onNotesChange={setNote} />
                    {/* Add extra padding at bottom to ensure content isn't hidden behind footer if keybaord is open or just for scroll space */}
                    <View style={styles.spacer} />
                </ScrollView>
            </View>

            {/* Bottom Action Bar */}
            <ButtonBarFarm
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSaveInfo}
                onSecondaryPress={() => navigation.goBack()}
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
