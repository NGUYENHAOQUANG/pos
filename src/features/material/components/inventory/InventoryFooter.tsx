import React from 'react';
import { FormSubmitFooter } from '@/features/material/components/FormSubmitFooter';

interface InventoryFooterProps {
    onSaveDraft: () => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSavingDraft?: boolean;
    isSubmitting?: boolean;
}

export const InventoryFooter: React.FC<InventoryFooterProps> = React.memo(props => (
    <FormSubmitFooter {...props} />
));
