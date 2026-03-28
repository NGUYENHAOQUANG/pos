import React from 'react';
import { DetailRow } from '@/features/material/components/DetailRow';
import { CurrencyValue } from '@/features/material/components/CurrencyValue';
import { FormSubmitFooter } from '@/features/material/components/FormSubmitFooter';

interface WarehouseFooterProps {
    totalAmount: number;
    onSaveDraft: () => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSavingDraft?: boolean;
    isSubmitting?: boolean;
}

export const WarehouseFooter: React.FC<WarehouseFooterProps> = React.memo(
    ({ totalAmount, ...rest }) => (
        <FormSubmitFooter
            header={
                <DetailRow
                    label="Tổng tiền:"
                    value={<CurrencyValue value={totalAmount} valueStyle={{ fontWeight: '700' }} />}
                />
            }
            {...rest}
        />
    )
);
