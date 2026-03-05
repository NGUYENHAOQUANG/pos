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
            titleStyle={{ fontSize: 18, fontWeight: '600', lineHeight: 28 }}
            onBack={onBack}
            rightComponent={rightAction}
            showBackButton={true}
        />
    );
};
