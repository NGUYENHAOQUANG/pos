import React from 'react';
import { ViewStyle, StyleProp, TextStyle } from 'react-native';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { useAppTheme } from '@/styles/themeContext';

interface ButtonBarMenuProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    primaryDisabled?: boolean;
    // secondaryType: 'default' | 'primary' | 'danger'
    secondaryType?: 'default' | 'primary' | 'danger';
    style?: StyleProp<ViewStyle>;
}

export const ButtonBarMenu: React.FC<ButtonBarMenuProps> = ({
    primaryTitle,
    secondaryTitle,
    onPrimaryPress,
    onSecondaryPress,
    primaryDisabled = false,
    secondaryType = 'default',
    style,
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
    } else if (secondaryType === 'danger') {
        secondaryButtonStyle.backgroundColor = theme.error;
        secondaryButtonStyle.borderColor = theme.error;
        secondaryButtonTextStyle.color = theme.white; // Error button usually white text even in dark mode
    } else {
        // default styling is already handled in shared ButtonBar (gray border, black text)
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
            secondaryButtonStyle={secondaryButtonStyle}
            secondaryButtonTextStyle={secondaryButtonTextStyle}
            containerStyle={style as ViewStyle}
        />
    );
};
