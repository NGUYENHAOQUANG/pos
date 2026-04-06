import React from 'react';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SiphonLossBox } from '@/features/farm/components/pondwork/xyphon/SiphonLossBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { SpecificType } from '@/features/material/types/warehouse.types';

interface SiphonFormInformationProps {
    generalInfoBoxRef: React.RefObject<GeneralInfoBoxRef | null>;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    imageUris: string[];
    onImagesChange: (uris: string[]) => void;
    documentIds: string[];
    lossAmount: string;
    onLossAmountChange: (value: string) => void;
    selectedMaterials: SelectedMaterialItem[];
    onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    notes: string;
    onNotesChange: (value: string) => void;
}

export const SiphonFormInformation: React.FC<SiphonFormInformationProps> = ({
    generalInfoBoxRef,
    selectedDate,
    onDateChange,
    imageUris,
    onImagesChange,
    documentIds,
    lossAmount,
    onLossAmountChange,
    selectedMaterials,
    onMaterialsChange,
    notes,
    onNotesChange,
}) => {
    return (
        <SafeInputLayout
            contentContainerStyle={{ padding: 0, paddingBottom: 100 }}
            extraScrollHeight={150}
        >
            <GeneralInfoBox
                ref={generalInfoBoxRef}
                type="withImage"
                date={selectedDate}
                onDateChange={onDateChange}
                imageUris={imageUris}
                onImagesChange={onImagesChange}
                documentIds={documentIds}
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
        </SafeInputLayout>
    );
};
