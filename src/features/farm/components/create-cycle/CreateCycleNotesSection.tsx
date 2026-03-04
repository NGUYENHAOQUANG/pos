import React from 'react';

import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { Control, Controller, useWatch } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';

interface Props {
    control: Control<CreateCycleFormValues>;
}

const CreateCycleNotesSection: React.FC<Props> = ({ control }) => {
    const activeNotes = useWatch({ control, name: 'notes' });

    return (
        <Controller
            control={control}
            name="notes"
            render={({ field: { onChange } }) => (
                <SelectionNotesBox notes={activeNotes || ''} onNotesChange={onChange} />
            )}
        />
    );
};

export default CreateCycleNotesSection;
