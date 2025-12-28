import React from 'react';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderMenuProps {
    title?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ title, onBack, rightAction }) => {
    return (
        <HeaderSection
            title={title}
            onBack={onBack}
            rightComponent={rightAction}
            showBackButton={true}
        />
    );
};
