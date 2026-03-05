import React from 'react';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderMeterialProps {
    title?: string;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    showBackButton?: boolean;
    includeSafeArea?: boolean;
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;
}

export const HeaderMeterial: React.FC<HeaderMeterialProps> = ({
    title = 'Quản Lý Vật Tư',
    onBackPress,
    rightComponent,
    showBackButton = true,
    includeSafeArea = true,
    rightIcon,
    onRightPress,
}) => {
    return (
        <HeaderSection
            includeSafeArea={includeSafeArea}
            title={title}
            onBack={onBackPress}
            rightComponent={rightComponent}
            rightIcon={rightIcon}
            onRightPress={onRightPress}
            showBackButton={showBackButton}
        />
    );
};
