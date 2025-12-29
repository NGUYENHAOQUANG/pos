import React from 'react';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderMeterialProps {
    title?: string;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    showBackButton?: boolean;
}

export const HeaderMeterial: React.FC<HeaderMeterialProps> = ({
    title = 'Quản Lý Vật Tư',
    onBackPress,
    rightComponent,
    showBackButton = true,
}) => {
    return (
        <HeaderSection
            title={title}
            onBack={onBackPress}
            rightComponent={rightComponent}
            showBackButton={showBackButton}
        />
    );
};
