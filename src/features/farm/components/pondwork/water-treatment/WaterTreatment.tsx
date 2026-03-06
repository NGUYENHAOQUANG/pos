import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SelectedMaterialItem } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { IMaterial } from '@/features/material/types/material.types';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';

interface WaterTreatmentProps {
    executionDate: Date;
    onExecutionDateChange: (date: Date) => void;
    activityType: string;
    onActivityTypeChange: (type: string) => void;
    materials: IMaterial[];
    selectedMaterials: SelectedMaterialItem[];
    onSelectedMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    note: string;
    onNoteChange: (note: string) => void;
    disabledDate?: boolean;
}

export const WaterTreatment: React.FC<WaterTreatmentProps> = ({
    executionDate,
    onExecutionDateChange,
    activityType,
    onActivityTypeChange,
    materials,
    selectedMaterials,
    onSelectedMaterialsChange,
    note,
    onNoteChange,
    disabledDate = false,
}) => {
    const activityOptions = ['Đánh khoáng', 'Đánh vi sinh', 'Kiểm khuẩn'];

    return (
        <View style={styles.container}>
            {/* General Information */}
            <GeneralInfoBox
                type="water_treatment"
                date={executionDate}
                onDateChange={onExecutionDateChange}
                activityLabel="Chọn loại hoạt động"
                activityOptions={activityOptions}
                selectedActivity={activityType}
                onSelectActivity={onActivityTypeChange}
                disabledDate={disabledDate}
            />

            {/* Materials Used */}
            <MaterialSelectionBox
                selectedMaterials={selectedMaterials}
                onMaterialsChange={onSelectedMaterialsChange}
                materials={materials}
            />

            <SelectionNotesBox notes={note} onNotesChange={onNoteChange} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
