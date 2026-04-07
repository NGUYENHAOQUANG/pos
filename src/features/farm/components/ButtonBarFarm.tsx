import React from 'react';
import { ViewStyle, StyleProp, TextStyle } from 'react-native';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { useAppTheme } from '@/styles/themeContext';

interface ButtonBarFarmProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void | Promise<void>;
    onSecondaryPress?: () => void | Promise<void>;
    primaryDisabled?: boolean;
    secondaryType?: 'default' | 'primary';
    style?: StyleProp<ViewStyle>;
    isLoading?: boolean;
}

export const ButtonBarFarm: React.FC<ButtonBarFarmProps> = ({
    primaryTitle,
    secondaryTitle,
    onPrimaryPress,
    onSecondaryPress,
    primaryDisabled = false,
    secondaryType = 'default',
    style,
    isLoading = false,
}) => {
    const hasSecondary = !!secondaryTitle;
    const mode = hasSecondary ? 'double' : 'single';
    const theme = useAppTheme();

    // Map secondaryType to styles
    const secondaryButtonStyle: ViewStyle = {};
    const secondaryButtonTextStyle: TextStyle = {};

    if (secondaryType === 'primary') {
        secondaryButtonStyle.borderColor = theme.primary;
        secondaryButtonTextStyle.color = theme.primary;
    } else {
        // default styling is already handled in shared ButtonBar (gray border, black text)
        // explicitly setting to ensure consistency with previous implementation if needed
        secondaryButtonStyle.borderColor = theme.defaultBorder;
        secondaryButtonTextStyle.color = theme.text;
    }

    return (
        <ButtonBar
            mode={mode}
            primaryTitle={primaryTitle}
            secondaryTitle={secondaryTitle}
            onPrimaryPress={onPrimaryPress}
            onSecondaryPress={onSecondaryPress}
            primaryButtonDisabled={primaryDisabled}
            primaryButtonLoading={isLoading}
            secondaryButtonStyle={secondaryButtonStyle}
            secondaryButtonTextStyle={secondaryButtonTextStyle}
            containerStyle={style as ViewStyle}
        />
    );
};
