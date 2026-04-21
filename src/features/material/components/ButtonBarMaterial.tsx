import React from 'react';
import { ButtonBar, ButtonBarProps, ButtonBarMode } from '@/shared/components/layout/ButtonBar';

// Re-export specific types if needed, or just use the shared ones
export type { ButtonBarMode };

// Use ButtonBarProps directly or extend/omit if necessary
// Original interface did not have containerStyle, but we can accept it or just omit it to be safe strict replacement
export interface ButtonBarMaterialProps extends ButtonBarProps {}

export const ButtonBarMaterial: React.FC<ButtonBarMaterialProps> = props => {
    return (
        <ButtonBar
            primaryTitle="Gửi Phiếu"
            secondaryTitle="Hủy"
            totalLabel="Tổng tiền:"
            totalValue="0đ"
            {...props}
        />
    );
};
