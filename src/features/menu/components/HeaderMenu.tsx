import React from 'react';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderMenuProps {
    title?: string;
    onBack?: () => void;
    backButtonDisabled?: boolean;
    rightAction?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
    title,
    onBack,
    backButtonDisabled,
    rightAction,
    rightIcon,
    onRightPress,
}) => {
    return (
        <HeaderSection
            title={title}
            titleStyle={{ fontSize: 18, fontWeight: '600', lineHeight: 28 }}
            onBack={onBack}
            rightComponent={rightAction}
            rightIcon={rightIcon}
            onRightPress={onRightPress}
            showBackButton={true}
            backButtonDisabled={backButtonDisabled}
        />
    );
};
