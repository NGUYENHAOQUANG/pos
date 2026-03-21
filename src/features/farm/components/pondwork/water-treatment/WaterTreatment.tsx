import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { MaterialSelectionBox } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { SpecificType } from '@/features/material/types/warehouse.types';

interface WaterTreatmentProps {
    executionDate: Date;
    onExecutionDateChange: (date: Date) => void;
    activityType: string;
    onActivityTypeChange: (type: string) => void;
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
                specificType={SpecificType.Normal}
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
