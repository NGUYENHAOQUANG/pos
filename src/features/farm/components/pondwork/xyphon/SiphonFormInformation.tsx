import React from 'react';
import {
    GeneralInfoBox,
    GeneralInfoBoxType,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SiphonLossBox } from '@/features/farm/components/pondwork/xyphon/SiphonLossBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { View } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { SpecificType } from '@/features/material/types/warehouse.types';

interface SiphonFormInformationProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    imageUris: string[];
    onImagesChange: (uris: string[]) => void;
    lossAmount: string;
    onLossAmountChange: (value: string) => void;
    selectedMaterials: SelectedMaterialItem[];
    onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    pointerEvents?: 'auto' | 'none';
}

export const SiphonFormInformation: React.FC<SiphonFormInformationProps> = ({
    selectedDate,
    onDateChange,
    imageUris,
    onImagesChange,
    lossAmount,
    onLossAmountChange,
    selectedMaterials,
    onMaterialsChange,
    notes,
    onNotesChange,
    pointerEvents = 'auto',
}) => {
    return (
        <SafeInputLayout
            contentContainerStyle={{ padding: 0, paddingBottom: 100 }}
            extraScrollHeight={150}
        >
            <View pointerEvents={pointerEvents}>
                <GeneralInfoBox
                    type={GeneralInfoBoxType.WITH_IMAGE}
                    date={selectedDate}
                    onDateChange={onDateChange}
                    imageUris={imageUris}
                    onImagesChange={onImagesChange}
                    disabledDate={true}
                />

                <SiphonLossBox lossAmount={lossAmount} onLossAmountChange={onLossAmountChange} />

                <MaterialSelectionBox
                    selectedMaterials={selectedMaterials}
                    onMaterialsChange={onMaterialsChange}
                    specificType={SpecificType.Normal}
                    isRequired={false}
                />

                <SelectionNotesBox notes={notes} onNotesChange={onNotesChange} />
            </View>
        </SafeInputLayout>
    );
};
